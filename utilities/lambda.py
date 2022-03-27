import json
import numpy as np
import requests
import pandas as pd
import pymongo
import random
from datetime import datetime

def get_df_from_payload(json_payload):
    """
    Takes in a json_payload as a list from json payload and returns the dataframe
    Our code requires the facilities, activities and users dataframe
    
    """ 
    data_df = pd.DataFrame()
    # json payload returned will be a list
    for single_json in json_payload:
        # convert python string to json object
        single_json = json.dumps(single_json)
        # convert json object to python dictionary
        data_dict = json.loads(single_json)
        # append python dictionary to dataframe
        data_df = data_df.append(data_dict, ignore_index=True)
        
    return data_df


### NOT NEEDED ANYMORE SINCE WE ARE doing it on NodeJS to filter list by userlocation ###

# def get_logged_user_from_payload(json_payload):
#     """
#     Takes in logged_user json payload as a dictionary from json payload of logged_user and returns the logged_user dataframe!
#     """
#     data_df = pd.DataFrame()
#     data_df = data_df.append(json_payload, ignore_index=True)
#     return data_df   

### NOT NEEDED ANYMORE SINCE WE ARE doing it on NodeJS to filter list by userlocation ###    

def locate_loggeduser_info_and_filter(single_df, full_df):
    # We want to find out more information from the single_df '_id' and match to full_df '_id' to find the full user's information like location
    # so that we are able to filter the rest of the users accordingly based on location. (narrow down our dataframe)
    
    # df = df.loc[df['_id'] == users_df['_id'].values[0]]
    # logged_user_id = single_df['_id'].values[0]
    logged_user_full_info_df = full_df.loc[full_df['_id'] == single_df['_id'].values[0]]
    
    # logged_user_location = logged_user_full_info_df['userLocation'].values[0]
    # return logged_user_full_info_df
    
    # filter the rest of the users_df to get a new filtered dataframe with all users staying near the location.
    # filtered_users_df = full_df.loc[full_df['userLocation'] == logged_user_full_info_df['userLocation'].values[0]]
    
    filtered_users_df = full_df.loc[full_df['userLocation'] == logged_user_full_info_df['userLocation'].values[0]]
    return filtered_users_df


# doing data preprocessing on dataframe, by converting lists to lists of strings
# so that we can combine the features together.
def preprocess_df(df):
    df['string_favSport'] = df['favSport'].apply(lambda x: ', '.join([str(i) for i in x]))
    df['string_userPreferredDay'] = df['userPreferredDay'].apply(lambda x: ', '.join([str(i) for i in x]))
    df['string_userPreferredTime'] = df['userPreferredTime'].apply(lambda x: ', '.join([str(i) for i in x]))
    return df

# # Combining relevant features into a single feature: (No TOWN INCLUDED)
def combined_features(row):
    return row['string_favSport']+" "+row['string_userPreferredDay']+" "+row['string_userPreferredTime']

def create_combined_features_col(df):
    # creating a combined features column by concatenating
    df['combined_features'] = df.apply(combined_features,axis=1)
    # remove commas in combined_feature column and make it lower case.
    df['combined_features'] = df['combined_features'].apply(lambda x: x.replace(',', '').lower())
    


# Creating count matrix for cosine similarity
def create_count_matrix(df):
    """
    Takes in a df, and returns the count matrix that is created and the all the unique words in the combined features column for all users.
    """
    # getting the respective unique words within the combined features column and count for each word for each unique word by doing the following:
    words, count = np.unique(' '.join(df['combined_features']).split(),return_counts=True)
    # create blank numpy array to be appended/vertically stacked to, with correct shape:
    count_matrix = np.zeros(len(words))

    # iterate through each user and then check the occurrence of each word in words list in combined features col
    for i in range(len(df.index)):
        # first specify a blank array to be appended to for word count, before vstacking it as row.
        A = np.array([])
        # iterate through each word in unique word list and check if any of these words appear in
        # the current row of data frame in combined features. if yes, add count += 1
        for j in range(len(words)):
            word_count = 0
            if words[j] in df['combined_features'][i]:
                word_count += 1
                A = np.append(A,word_count)
            else:
                A = np.append(A,word_count)
        count_matrix = np.vstack((count_matrix, A))
        # remove first row of our count matrix to get the final count matrix!
    
    count_matrix = np.delete(count_matrix,0, axis=0)
    return count_matrix, words
    

def calc_cosine_sim(user_df,count_matrix, words):
    """
    Takes in a count_matrix, and unique words from all similar users.
    It first generates the user matrix based on all words detected in the combined_features columns,
    Then it proceeds to calculate cosine similarity between the user_matrix (count of words for the user) to the overall count matrix for all filtered users
    in the similar location as the current logged in user.
    RETURNS the cosine similarity matrix for this particular logged in user compared to all other users.
    """
    # create blank numpy array to be appended/vertically stacked to, with correct shape, based on total number of words:
    user_matrix = np.zeros(len(words))
    # Create an empty numpy array initially.
    B = np.array([])
    # iterate through all the words
    for j in range(len(words)):
    #     print(words[j])
        word_count = 0
        if words[j] in user_df['combined_features'].values[0]:
            word_count += 1
            B = np.append(B,word_count)
        else:
            B = np.append(B,word_count)
    
    
    user_matrix = np.vstack((user_matrix,B))
    #remove first row of our user matrix to get the final user count matrix!
    user_matrix = np.delete(user_matrix,0,axis=0)
    
    # once we have the user_matrix, we can calcualte cosine similarity between user_matrix and the count_matrix generated
    #calculate Cosine Similarity python
    cosine_sim = np.dot(user_matrix, count_matrix.T)/(np.linalg.norm(user_matrix)*np.linalg.norm(count_matrix.T))
    print("The Cosine Similarity between two vectors is: ",cosine_sim)
    
    return cosine_sim
        
        
def recommendations(df,favsport, cosine_sim, indices):
    """
    Takes in dataframe df, favsport input as a string for a single user, and the current cosine_sim matrix
    that is calculated by the logged in user to all other users based on previous combined features.
    
    Returns a sorted recommended users dataframe up to top 10, by descending cosine_sim scores.
    This returned dataframe can be used by our code to output the relevant activities tied to
    these users.
    """
    # creating empty sorted users dataframe
    sorted_users_df = pd.DataFrame(columns=df.columns)
    
    # getting the indexes of the players that match the title from a single user
    idx = indices[indices == favsport].index
    
    # creating a series with similarity scores in descending order
    score_series = pd.Series(cosine_sim[0][idx])
    
    # create new data frame to store similar users data to this current user and sort by descending order
    sim_users_df = pd.DataFrame(data={'index':idx,'cossim_scores':score_series})
    sim_users_df.sort_values(by='cossim_scores', ascending=False,inplace=True)
    
    # getting the indexs of the top few (10 by default) most similar users after storting.
    top_10_indexes = list(sim_users_df.iloc[1:11]['index'])
    
    # return a dataframe containing the users information so that we can use it.
    
    ## Note, since we are using the filtered users list, the indexes no longer match one another. How are we going to match the users to original dataframe? ##
    # Problem: the index in the filtered users list will not match that of the original dataframe! #
    
    for i in top_10_indexes:
        sorted_users_df = pd.concat([sorted_users_df,df[df.index == i]])
        
    return sorted_users_df, sim_users_df




# create a function to get all the sorted_users' id to be stored in a list, which will be used to compare to the activity_df['hostID'] column
def create_userid_list(df):
    """
    Takes in the sorted users dataframe and retrieves a list of user ids
    """ 
    useridlist = [] # to store all userid from the sorted users dataframe
    for row in df.iterrows():
        useridlist.append(row[1]['_id'])
    return useridlist


# create a function to return a new dataframe from the activity dataframe that only contains the sorted users information.
# we cannot take directly from activity dataframe as the function .isin() will automatically sort it for us, losing the order.
def activities_by_similar_users(activitydf, userid_list):
    """
    Takes in the activity_df, sorted userid_list from above.
    Returns a dataframe containing only the activities hosted by the sorted users id list.
    """
    new_df = pd.DataFrame(columns=activitydf.columns)
    
    for userid in userid_list:
        new_df = new_df.append(activitydf.loc[activitydf['hostID'] == userid])
    
    return new_df
    




# all preferred locations
pref_loc_list = ['West','East','Central','North','South']

# Manually sort the SG areas/towns into Central, North, South, East, West
# for users entry
loc_west = ['Lim Chu Kang', 'Choa Chu Kang', 'Bukit Panjang', 'Tuas', 'Jurong East', 'Jurong West', 'Jurong Industrial Estate', 'Bukit Batok', 'Hillview', 'West Coast', 'Clementi']
loc_north = ['Admirality', 'Kranji', 'Woodlands', 'Sembawang', 'Yishun', 'Yio Chu Kang', 'Seletar', 'Sengkang']
loc_south = ['Holland', 'Queenstown', 'Bukit Merah', 'Telok Blangah', 'Pasir Panjang', 'Sentosa', 'Marina South','Geylang']
loc_east = ['Serangoon', 'Punggol', 'Hougang', 'Tampines', 'Pasir Ris', 'Loyang', 'Simei', 'Kallang', 'Katong', 'East Coast', 'Macpherson', 'Bedok']
loc_central = ['Thomson', 'Marymount', 'Sin Ming', 'Ang Mo Kio', 'Bishan', 'Serangoon Gardens', 'MacRitchie', 'Toa Payoh']
all_loc_sg = [
    'Lim Chu Kang', 'Choa Chu Kang', 'Bukit Panjang', 'Tuas', 'Jurong East', 'Jurong West', 'Jurong Industrial Estate', 'Bukit Batok', 'Hillview', 'West Coast', 'Clementi',
    'Admirality', 'Kranji', 'Woodlands', 'Sembawang', 'Yishun', 'Yio Chu Kang', 'Seletar', 'Sengkang',
    'Holland', 'Queenstown', 'Bukit Merah', 'Telok Blangah', 'Pasir Panjang', 'Sentosa', 'Marina South','Geylang',
    'Serangoon', 'Punggol', 'Hougang', 'Tampines', 'Pasir Ris', 'Loyang', 'Simei', 'Kallang', 'Katong', 'East Coast', 'Macpherson', 'Bedok',
    'Thomson', 'Marymount', 'Sin Ming', 'Ang Mo Kio', 'Bishan', 'Serangoon Gardens', 'MacRitchie', 'Toa Payoh'
]
# sort the Active SG areas manually
fac_west = ['Tampines Avenue 4','Jurong East Street 31','West Coast Walk','Clementi Avenue 3','Jurong West Street 93','Bukit Batok Street 22','Bukit Batok West Avenue 5','Choa Chu Kang Street 53','Fourth Chin Bee Road']
fac_east = ['Pasir Ris Central','Bedok North Street 1','Hougang Avenue 4','Bedok North Street 2',]
fac_north = ['Anchorvale Road', 'Woodlands Street 12','Yishun Avenue 1', 'Yishun Avenue 3',]
fac_south = ['Stirling Road', 'Yio Chu Kang Road','Evans Road','Tiong Bahru Road','Lengkok Bahru','Aljunied Crescent Avenue 1','Lorong 12 Geylang', 'Rutland Road','Tyrwhitt Road','Geylang Bahru Lane','Stadium Road','Wilkinson Road']
fac_central = ['Lorong 6 Toa Payoh', 'St Wilfred Road', 'Ang Mo Kio Avenue 9','Ang Mo Kio Avenue 1', 'Bishan Street 14','Burghley Drive']




def lambda_handler(event,context):
    df = get_df_from_payload(event['users'])
    activity_df = get_df_from_payload(event['activity'])
    # facilities_df = get_df_from_payload(event['facility'])
    logged_user_df = event['logged_user']
    
    # # create strings from different columns
    df = preprocess_df(df)
    
    # combine the strings from different columns to create a combined features (Bag of Words column)
    create_combined_features_col(df)
    
    # create count matrix for all filtered users by userLocation.
    cnt_matrix, words = create_count_matrix(df)
    
    # get full logged user df from the preprocessed df by matching the user name.
    full_logged_user_df = df.loc[df['username'] == logged_user_df['username']]
    
    # get cosine similarity scores for logged in user to all similar users.
    cosine_sim = calc_cosine_sim(full_logged_user_df, cnt_matrix, words)
    # # save a set of indices of all favourite sports of similar users by location.
    # indices = pd.Series(df['string_favSport'])
    
    # # recommended users dataframe by his favourite sport:
    # # recommended_users_df = recommendations(df,f'{full_logged_user_df["string_favSport"]}', cosine_sim, indices)
    # recommended_users_df, test_df = recommendations(df,full_logged_user_df["string_favSport"].values[0], cosine_sim, indices)
    
    # # drop unnecessary columns that were not part of original df:
    # # recommended_users_df2 = recommended_users_df.drop(columns=['string_favSport', 'string_userPreferredDay','string_userPreferredTime','combined_features'], axis=1)
    
    # # get list of all user id's from recommended users df
    # sorted_userid_list = create_userid_list(recommended_users_df)
    # testing = pd.DataFrame(sorted_userid_list, columns=['testing'])
    
    
    # # using the above list, search within the activity_df 'hostID' column to find the activities hosted by these users.
    # final_activities_df = activities_by_similar_users(activity_df, sorted_userid_list)
    
    
    # new_df = pd.DataFrame(columns=activity_df.columns)
    
    # new_df = new_df.append(activity_df.loc[activity_df['hostID'] == '623f5a0b08358177706f0f42'])
    
    
    # # convert recommended users dataframe to json to be parsed back to server to render homepage view!
    # final_activities_json = final_activities_df.to_json(default_handler=str, orient='records')
    
    
    # ### TESTING ### Works up till recommended_users_df returns empty dataframe.
    # # python 
    # testing_dict = final_activities_df.to_dict(orient='records')
    # # json string
    # testtest = json.dumps(testing_dict, default=str)
    
    ######
    orderlist = []
    for i, v in enumerate(cosine_sim[0]):
        orderlist.append((i,v))
    orderlist.sort(key=lambda x: x[1], reverse = True)
    o = pd.DataFrame(orderlist, columns=['orignalidx','sim'])
    o = o.iloc[1:,]
    o['order'] = o.index
    
    userids = df[['_id']].copy()
    userids = userids.rename(columns={'_id':'hostID'})
    userids['i']= userids.index
    neworder = pd.DataFrame.merge(o, userids, left_on='orignalidx', right_on = 'i')
    neworder = neworder[['order','hostID']]
    newactivity = pd.DataFrame.merge(activity_df, neworder, left_on='hostID', right_on='hostID')
    newactivity = newactivity.sort_values('order')
    newactivity = newactivity.drop(['__v','order'], axis = 1)
    
    return newactivity.to_dict(orient='records')



    