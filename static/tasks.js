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

        var totals = {'activity_id': {}, "category": {}, 'tags': {}, 'days': {}, 'all': 0}
        var activities = {}
        var date = "";

        response.forEach(function(task){
            var tags = "";
            var addDate = "";

            task['tags'].forEach(function(tag){
                tags += "<span class='tag badge blue'>" + tag + "</span>";
                if(!(tag in totals["tags"]))
                totals["tags"][tag] = 0;

                totals["tags"][tag] += task['delta']
            });

            activities[task['activity_id']] = task['name']

            var str =
                "<td class='start'>" + task['start_time'].split(' ')[1] + "</td>" +
                "<td class='end'>" + task['end_time'].split(' ')[1] + "</td>" +
                "<td class='name'>" + task['name'] + tags + "</td>" +
                "<td class='category'>" + task['category'] + "</td>" +
                "<td class='delta'>" + task['delta'] + "</td>";

            if(date != task['start_time'].split(' ')[0]){
                date = task['start_time'].split(' ')[0];
                addDate = "<tr class='task light-green lighten-4' id='date-" + date.replace(/\./g, '') + "'><td colspan='3' class='date'>" + date + "</td></tr>";
            }

            $('#tasks').append(addDate + "<tr class='task'>" + str + "</tr>");

            if(!(task["activity_id"] in totals["activity_id"]))
                totals["activity_id"][task['activity_id']] = 0;
            if(!(task['category'] in totals["category"]))
                totals["category"][task['category']] = 0;
            if(!(date in totals["days"]))
                totals["days"][date] = 0;

            totals["days"][date] += task['delta'];
            totals['activity_id'][task['activity_id']] += task['delta'];
            totals['category'][task['category']] += task['delta'];
            totals['all'] += task['delta'];
        });

        $('#totals').html(
            "<h5>Задачи</h5>" + "<table id='activity'></table>" +
            "<h5>Категории</h5>" + "<table id='category'></table>" +
            "<h5>Теги</h5>" + "<table id='tags'></table>" +
            "<h5>Всего <span id='all-time'></span></h5>"
        );

        keysSorted = Object.keys(totals['activity_id']).sort((a,b) => totals['activity_id'][b]-totals['activity_id'][a])
        keysSorted.forEach(function(key){
            total = totals['activity_id'][key];
            var str =
                "<td>" + activities[key] + "</td>" +
                "<td>" + Math.round(total *100)/100 + "</td>";
            $('#activity').append("<tr>" + str + "</tr>");
        });

        keysSorted = Object.keys(totals['category']).sort((a,b) => totals['category'][b]-totals['category'][a])
        keysSorted.forEach(function(key){
            total = totals['category'][key];
            var str =
                "<td>" + key + "</td>" +
                "<td>" + Math.round(total *100)/100 + "</td>";
            $('#category').append("<tr>" + str + "</tr>");
        });

        keysSorted = Object.keys(totals['tags']).sort((a,b) => totals['tags'][b]-totals['tags'][a])
        keysSorted.forEach(function(key){
            total = totals['tags'][key];
            var str =
                "<td>" + key + "</td>" +
                "<td>" + Math.round(total *100)/100 + "</td>";
            $('#tags').append("<tr>" + str + "</tr>");
        });

        $('#all-time').text(Math.round(totals['all'] *100)/100);

        $.each(totals['days'], function(key, total){
            $('#date-' + key.replace(/\./g, '')).append("<td>" + Math.round(total *100)/100 + "</td>");
        })
    });
}