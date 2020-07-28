$(document).ready(function() {
  // city search
  $("#search-button").on("click", function() {
    var searchValue = $("#search-value").val();

    // clear input box
    $("#search-value").val("");

    searchWeather(searchValue);
  });

  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });
  
  // store search history
  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  // Today's weather
  var APIKey = "&appid=58474e01b34b813bae3350fc4c88341e";
  var queryURLCurrent = "https://api.openweathermap.org/data/2.5/weather?q=";

  function searchWeather(searchValue) {
    $.ajax({
      type: "GET",
      url: queryURLCurrent + searchValue + APIKey,
      dataType: "json",
      success: function(data) {
        // create history link for this search
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
    
          makeRow(searchValue);
        }
        console.log("current: " + queryURLCurrent + searchValue + APIKey);

        // create html content for current weather
        var icon = $("<img>").attr("src", "http://openweathermap.org/img/wn/" + data.weather[0].icon + ".png");
        $("#city").html(data.name + " " + "*" + " " + moment().format('dddd' + " " + 'M/DD/YY') + " ");
        $("#city").append(icon);
        var tempF = ((data.main.temp -273.15) * 1.80 + 32).toFixed(1);
        $("#temp-today").text(tempF);
        $("#hum-today").text(data.main.humidity);
        $("#wind").text(data.wind.speed);
        
        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }

  // 5-day Forecast
  var queryURLForecast = "https://api.openweathermap.org/data/2.5/forecast?q=";
  
  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: queryURLForecast + searchValue + APIKey,
      dataType: "json",
      success: function(data) {
        // clear previous data
        $("#forecast").empty();
        
        $("#forecast").append($("<h1>").text("5-Day Forecast: "));
        var row = $("<div>").addClass("row");
        $("#forecast").append(row);

        var days = 0;
        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            
            var col = $("<div>").addClass("col-md-2");
            var forecastCard = $("<div>").addClass("card text-white bg-primary mb-3").attr("style", "max-width: 16em");
            var cardBodyEl = $("<div>").addClass("card-body");

            days++;
            var cardHeaderEl = $("<h5>").addClass("card-title").text(moment().add(days, 'days').format('M/DD/YY'));
            
            var forecastIconEl = $("<img>").attr("src", "http://openweathermap.org/img/wn/" + data.list[i].weather[0].icon + ".png").addClass("card-title");
            var tempF = ((data.list[i].main.temp -273.15) * 1.80 + 32).toFixed(1);
            var forecastTempEl = $("<div>").addClass("card-title").text("Temp: " + tempF + " \u00B0" + "F");
            var forecastHumEl = $("<div>").addClass("card-title").text("Humidity: " + data.list[i].main.humidity + "%");

            forecastCard.append(cardBodyEl);
            cardBodyEl.append(cardHeaderEl, forecastIconEl, forecastTempEl, forecastHumEl);
            row.append(col.append(forecastCard));
          }
        }

        console.log("forecast: " + queryURLForecast + searchValue + APIKey);
      }
    });
  }
  
  // UV data
  var queryURLUV = "https://api.openweathermap.org/data/2.5/uvi?appid=58474e01b34b813bae3350fc4c88341e";

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: queryURLUV + "&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function(data) {
        console.log("UV: " + queryURLUV + "&lat=" + lat + "&lon=" + lon);
        var btn = $("#UV");
        
        // change color depending on uv value
        if(data.value >= 11) {
          btn.attr("style", "background-color: orange");
        }
        else if(data.value >= 8 && data.value < 11) {
          btn.removeAttr("style");
          btn.addClass("btn-danger");
        }
        else if(data.value >= 6 && data.value < 8) {
          btn.removeClass("btn-danger");
          btn.attr("style", "background-color: pink");
        }
        else if(data.value >= 3 && data.value < 6) {
          btn.removeAttr("style");
          btn.addClass("btn-warning");
        }
        else {
          btn.removeClass("btn-warning");
          btn.addClass("btn-success");
        }

        btn.addClass("btn btn-sm").text(data.value);
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }

  var cloudPic = "assets/clouds.jpg";
  var dayPic = "assets/day-bckgrnd.jpg";
  var stormPic = "assets/lightning.jpg";
  var eyePic = "assets/eye.jpg";
  var umbrellaPic = "assets/umbrellas.jpg";
  var picArr = [cloudPic, dayPic, stormPic, eyePic, umbrellaPic];
  var randPic = picArr[Math.floor(Math.random() * picArr.length)];

  $("body").css("background-image", "url(" + randPic + ")");
});
