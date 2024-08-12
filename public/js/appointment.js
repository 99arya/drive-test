$(function () {
  // Function to fetch and render test results based on filter
  function fetchTestResults(filter = "ALL") {
    if (filter == "PASS") {
      filter = true;
    } else if (filter == "FAIL") {
      filter = false;
    }
    axios
      .get(`/get-test-results/${filter}`)
      .then(function (response) {
        let { data } = response;
        renderTestResults(data);
      })
      .catch(function (error) {
        alert("Error: " + error.response?.data);
      });
  }

  // Render test results in the table
  function renderTestResults(data) {
    const testResultsList = $("#testResultsList");
    testResultsList.empty(); // Clear existing results

    console.log("data", data);
    data.forEach((result) => {
      const dateString = new Date(result.appointment.date).toLocaleDateString();
      const row = `<tr>
        <td>${result.firstName} ${result.lastName}</td>
        <td>${result.testType}</td>
        <td>${result.licenseNumber}</td>
        <td>${result.car_details.plateNumber}</td>
        <td>${dateString} ${result.appointment.time}</td>
        <td>${result.passedTest ? "PASSED" : "FAILED"}</td>
        <td>${result.testComment}</td>
      </tr>`;
      testResultsList.append(row);
    });
  }

  // Initial fetch of test results with default filter 'ALL'
  fetchTestResults();

  let selectedTime, selectedDate;

  $("#datepicker").datepicker();

  $("#search-appointment").on("click", function (event) {
    let dateEntered = $("#datepicker").datepicker("getDate");

    if (!dateEntered) {
      alert("Please enter a date!");
      return;
    }

    $(".available-slots").css("display", "block");
    $("#slot-date").text(dateEntered.toDateString());

    axios
      .get(`/get-slots/${dateEntered.toDateString()}`)
      .then(function (response) {
        let { data } = response;
        let allSlots = $(".slot-card");
        allSlots.removeClass("slot-booked");
        allSlots.addClass("slot-available");
        data.map((i) => {
          let slot = document.getElementById(i.time);
          slot.classList.add("slot-booked");
          slot.classList.remove("slot-available");
        });
      })
      .catch(function (error) {
        alert("Error: " + error.response.data);
      });
  });

  $(".slot-available").on("click", function (event) {
    let isAvailable = Array.from(event.currentTarget.classList).includes("slot-available");

    if (isAvailable) {
      $(".date-time-selected").css("display", "block");
      selectedTime = event.currentTarget.innerText;
      selectedDate = $("#datepicker").datepicker("getDate");

      $(`#selected-date`).text(selectedDate.toDateString());
      $(`#selected-time`).text(selectedTime);
    } else {
      alert("This slot is booked");
    }
  });

  $("#create-slot").on("click", function (event) {
    axios
      .post("/create-slot", { selectedDate, selectedTime })
      .then(function (response) {
        alert(response.data.message);
        $("#search-appointment").click();
        $(".date-time-selected").css("display", "none");
      })
      .catch(function (error) {
        alert("Error: " + (error.response?.data || error.message));
      });
  });

  // Event listener for result filter change
  $("#resultFilter").on("change", function () {
    let selectedFilter = $(this).val();
    console.log("selectedFilter", selectedFilter);
    fetchTestResults(selectedFilter);
  });
});
