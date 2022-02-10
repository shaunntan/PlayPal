jQuery(document).ready(function($) {
    $('*[data-href]').on('click', function() {
        window.location = $(this).data("href");
    });
});

function filterTable() {
    const sport = $('#sportfilter :selected').text();

    tbody = document.getElementById("listofactivities");
    tr = tbody.getElementsByTagName("tr");

    if (sport !== "Show All") {
        for (i = 0; i < tr.length; i++) {
    
            if (tr[i].className === sport) {
              tr[i].style.display = "";
            } else {
              tr[i].style.display = "none";
            }
    
        }
    } else {
        for (i = 0; i < tr.length; i++) {
            tr[i].style.display = "";
        }
    }
};


function fillHostingForm() {
    const locationID = $('#locationSelector :selected').attr("id");
    const locationText = $('#locationSelector :selected').text();
    const locString = $('#locationSelector :selected').attr("name");
    

    // console.log(locationID);
    // console.log(locationText);

    initMap(locString.split(","));

    $('#locationname').val(locationText);
    $('#locationid').val(locationID);

};

function readImg(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
        console.log(input);
      reader.onload = function (e) {
        $('#showProfilePic').attr('src', e.target.result).width(150);
      };
  
      reader.readAsDataURL(input.files[0]);
    }
  }
