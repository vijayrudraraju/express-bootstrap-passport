String.prototype.unescapeHtml = function () {
  var temp = document.createElement("div");
  temp.innerHTML = this;
  var result = temp.childNodes[0].nodeValue;
  temp.removeChild(temp.firstChild);
  return result;
}

//- our websocket
//- var socket = io.connect(snapvotr.jit.su);
var socket = io.connect();

//- current state of the voting at load time, updated via websockets
var data = "#{voteoptions}";

var voting_string = data.unescapeHtml();

var voting = JSON.parse(voting_string);

//- our live chart
var chart;

//- Attach a handler to the window load event.
$(document).ready(function() {

  var chartdata = [], labels = [];

  voting.forEach(function(vo, i) {
    //- the number of votes
    chartdata.push(vo.votes);
    //- the label for this data point
    labels.push(vo.name+' - '+(i+1));
  }); 

  chart = new Highcharts.Chart({
    chart: {
      renderTo: 'chart',
      type: 'bar'
    },

    title: {
       text: 'Here are your results:'
     },

    //- subtitle: {
    //-   text: 'Powered by Twilio, Nodejitsu & Cloudant'
    //- },

    xAxis: {
      categories: labels,
      title: {
        text: null
      },
      labels: {
        style: {
          fontSize: '1.3em',
          fontWeight: 'bold'
        }
      }
    },

    yAxis: {
      min: 0,
      title: {
        text: 'Votes',
        align: 'high'
      },
    },

    tooltip: {
      formatter: function() {
        return ''+'Text "'+(this.point.x+1)+'" to vote for '+this.x;
      }
    },

    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '1.3em',
            fontWeight: 'bold'
          }
        }
      }
    },

    legend: {
      enabled: false
    },

    credits: {
      enabled: false
    },

    series: [{name: 'Votes',data: chartdata}]
  });   

  socket.on('vote', function(data) {
    console.log('Incoming vote!', data);
    vote = parseInt(data);
    index = vote - 1;
    votes = chart.series[0].data[index].y;
    chart.series[0].data[index].update(votes+1);
  });

  socket.on('connect', function() {
    console.log("Connected, lets sign-up for updates about votes for this event");
    socket.emit('event', '#{shortname}');
  });
});