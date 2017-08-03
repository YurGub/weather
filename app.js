function App (table, yearStart, yearFinal) {
    this.table = table;
    this.yearStart = yearStart;
    this.yearFinal = yearFinal;

    (function () {
        getDataFn(this.table, this.yearStart, this.yearFinal);
    })(table, yearStart, yearFinal);
}

var table = "temperature";
var initSelect  = document.getElementById("init");
var finalSelect = document.getElementById("final");

initSelect.onchange  = () => checkFinal();
finalSelect.onchange = () => checkInit();
App(table, initSelect.value, finalSelect.value);


function getDataFn (table,start, final) {
    /*здесь берем файлы из INDB*/
    var url = 'http://localhost/meta/'+ table +'.json';
    getJSON(url , function(err, data) {
        if (err != null) {
            alert('Something went wrong: ' + err);
        } else {
            parseData(data, start, final)
        }
    });
}

function parseData (data, start, final) {
    var temperature = {};
    for (var i = 0; i < data.length; i++) {
        var values = data[i]['t'].split('-');

        if (values[1].split('')[0] == 0) {
            var month = values[1].split('')[1];
        } else {
            month = values[1];
        }

        if (values[2].split('')[0] == 0) {
            var day = values[2].split('')[1];
        } else {
            day = values[2];
        }

        if (!temperature[values[0]]) {
            temperature[values[0]] = {};
            temperature[values[0]][month] = {};
            temperature[values[0]][month][day] = data[i].v;
        } else {
            if (!temperature[values[0]][month]) {
                temperature[values[0]][month] = {};
                temperature[values[0]][month][day] = data[i].v;
            } else {
                temperature[values[0]][month][day] = data[i].v;
            }
        }
    }

    renderChartFn(temperature, start, final);
}


function renderChartFn (data, start, finish) {

    var canvas = document.getElementById("chart");
    var months = [];
    var avg = 0;

        if (canvas.getContext){
            var context = canvas.getContext("2d");
            context.clearRect(0, 0, 1060, 400);

            for (var i = start; i <= finish; i++) {
                for (var j = 1; j <= 12; j++) {
                    getAvgForMonths(data[i][j]);
                }
            }

            

            var step = 30;
            var stepX = 1000 / ((finish - start + 1) * 12);

            if (table == "temperature") {
                setContextGrid (45, 5);
                var scaleY = 4;
                var startValue = 200;

            } else if (table == "precipitation") {
                setContextGrid (10, 0.5);
                var scaleY = 40;
                var startValue = 400;
            }
            
            context.stroke();
            context.closePath();

            context.beginPath();
            context.lineWidth = 2;

            setContextChart(scaleY, startValue);

            function setContextChart (scaleY, startValue) {
                
                var startPoint = startValue - (Number(months[0])*scaleY);
                context.moveTo(step, startPoint);

                for (var i = 0; i < months.length; i++) {
                    var y = startValue - (Number(months[i])*scaleY);
                    context.lineTo(step, y);
                    step += stepX;
                }
                context.strokeStyle = '#000000';
                context.stroke();
            }

            function getAvgForMonths (obj) {
                var count = 0;
                var sum = 0;

                for (var index in obj) {
                    sum += Number(obj[index]);
                    count++;
                }
                months.push((sum / count).toFixed());
                count = 0;
            }
            function setContextGrid (max, stpY) {
                context.beginPath();
                context.lineWidth = 0.5;
                context.strokeStyle = '#aaaaaa';

                for (var i = 20; i < 400; i+= 20) {
                    context.moveTo(0, i);
                    context.lineTo(1060, i);
                    context.fillText(max, 10, i);
                    max -= stpY;
                }

                var mrg = 30;
                context.moveTo(mrg, 0);
                context.lineTo(mrg, 400);
                if (+finish - +start < 9) {
                    var a = 1000 / (+finish - +start + 1);
                    for (var k = a; k <= 1000; k+=a) {
                        context.moveTo(k + mrg , 0);
                        context.lineTo(k + mrg , 400);
                        context.fillText(start++, k + mrg - a, 10);
                    }

                } else {
                    for (var j = 100; j <= 1000; j+=100) {
                        context.moveTo(j + mrg , 0);
                        context.lineTo(j + mrg , 400);
                        context.fillText(start++, j + mrg - 100, 10);
                    }
                }
            }
        }


        else {
            alert('Не удалось загрузить график')
        }
}


function getJSON (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        var status = xhr.status;
        if (status == 200) {
            callback(null, xhr.response);
        } else {
            callback(status);
        }
    };
    xhr.send();
};

function checkFinal (min, max) {
    
    var options = finalSelect.querySelectorAll('option');
    var initYear = initSelect.value;

    resetDisabled(options);

    for (var i = 0; i < options.length; i++) {

        if (options[i].value < initYear) {
            options[i].setAttribute('disabled', true);
        }
    }
    App(table, initSelect.value, finalSelect.value);
}

function checkInit (min, max) {
    var options = initSelect.querySelectorAll('option');
    var finalYear = finalSelect.value;

    resetDisabled(options);

    for (var i = 0; i < options.length; i++) {

        if (options[i].value > finalYear) {
            options[i].setAttribute('disabled', true);
        }
    }
    App(table, initSelect.value, finalSelect.value);
}

function resetDisabled (elems) {
    for (var i = 0; i < elems.length; i++) {
        elems[i].disabled = false;
    }
}

