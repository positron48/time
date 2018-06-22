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

        var charts = {
            activity: {labels: [], data:[]},
            category: {labels: [], data:[]},
            days: {labels: [], data:[]},
            tags: {labels: [], data:[]},
        };

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
            charts['days']['labels'].push(key);
            charts['days']['data'].push(Math.round(total *100)/100);
            $('#date-' + key.replace(/\./g, '')).append("<td>" + Math.round(total *100)/100 + "</td>");
        });

        $.each(totals['category'], function(key, total){
            charts['category']['labels'].push(key);
            charts['category']['data'].push(Math.round(total *100)/100);
        });

        $.each(totals['days'], function(key, total){
            charts['days']['labels'].push(key);
            charts['days']['data'].push(Math.round(total *100)/100);
        });

        $.each(totals['activity_id'], function(key, total){
            charts['activity']['labels'].push(activities[key]);
            charts['activity']['data'].push(Math.round(total *100)/100);
        });

        $.each(totals['tags'], function(key, total){
            charts['tags']['labels'].push(key);
            charts['tags']['data'].push(Math.round(total *100)/100);
        });

        showChart("chartDays", charts['days']['labels'], charts['days']['data']);
        showChart("chartCategory", charts['category']['labels'], charts['category']['data']);
        showChart("chartActivity", charts['activity']['labels'], charts['activity']['data']);
        showChart("chartTags", charts['tags']['labels'], charts['tags']['data']);

        console.log(charts);
    });
}


function showChart(chartId, labels, data){
    var ctx = document.getElementById(chartId).getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                //label: '# of Votes',
                data: data,
                /*backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1*/
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            },
            legend: {
                display: false
            }
        }
    });
}