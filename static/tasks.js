$(document).ready(function(){

    $('#interval-picker').datepicker({
        multipleDatesSeparator: '-',
        range: true,
        onSelect: function(formattedDate, date, inst) {
            loadItems();
        }
    })

});


function loadItems(){
    $.ajax({
        method: "GET",
        url: "/api/tasks",
        data: {
            interval: $('#interval-picker').val()
        },
        dataType: 'json'
    })
    .done(function( response ) {
        console.log(response);
        $('#tasks').html("");

        response.forEach(function(task){
            var tags = "";
            task['tags'].forEach(function(tag){
                tags += "<span class='tag badge blue'>" + tag + "</span>";
            });


            var str =
                "<td class='start'>" + task['start_time'].split(' ')[1] + "</td>" +
                "<td class='end'>" + task['end_time'].split(' ')[1] + "</td>" +
                "<td class='name'>" + task['name'] + tags + "</td>" +
                "<td class='category'>" + task['category'] + "</td>" +
                "<td class='delta'>" + task['delta'] + "</td>";

            $('#tasks').append("<tr class='task'>" + str + "</tr>");
        });
    });
}