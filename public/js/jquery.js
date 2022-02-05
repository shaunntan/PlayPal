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