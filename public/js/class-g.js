$(function () {
  $("#datepicker").datepicker();
  // Fetch user data with license number
  $("#fetchLicenseData").on("click", function (event) {
    const inputLicenseNumber = $("#inputLicenseNumber").val();

    axios
      .get(`/get-user/${inputLicenseNumber}`)
      .then(function (response) {
        let { data } = response;
        let { make, model, plateNumber, year } = data.car_details;

        $("#gUserInfo").css("visibility", "visible");
        $("#gCarInfo").css("visibility", "visible");

        $("#firstName").val(data.firstName);
        $("#lastName").val(data.lastName);
        $("#licenseNumber").val(data.licenseNumber);
        $("#age").val(data.age);

        let date = new Date(data.dob);
        console.log("date", date);
        $("#dob").val(date);

        $("#make").val(make);
        $("#model").val(model);
        $("#plateNumber").val(plateNumber);
        $("#year").val(year);
      })
      .catch(function (error) {
        alert("Error: " + error.response.data);
      });

    // Update vehicle details
    $("#g-form-vehicle").on("click", function (event) {
      const userData = {
        licenseNumber: $("#inputLicenseNumber").val(),
        make: $("#make").val(),
        model: $("#model").val(),
        year: $("#year").val(),
        plateNumber: $("#plateNumber").val(),
      };

      // Simple data validation checks
      function isNonEmptyString(value) {
        return typeof value === "string" && value.length > 0;
      }

      function isNumeric(value) {
        return !isNaN(value) && value.trim() !== "";
      }

      function isValidYear(value) {
        const year = parseInt(value, 10);
        return isNumeric(value) && year >= 1886 && year <= new Date().getFullYear();
      }

      function displayError(field, message) {
        $(`#${field}_error`).text(message);
      }

      function clearErrors() {
        $(".error-message").text("");
      }

      // Clear previous errors
      clearErrors();

      const errors = [];

      if (!isNonEmptyString(userData.make)) {
        errors.push({ field: "make", message: "Car make is required." });
      }

      if (!isNonEmptyString(userData.model)) {
        errors.push({ field: "model", message: "Car model is required." });
      }

      if (!isValidYear(userData.year)) {
        errors.push({
          field: "year",
          message: "Car year must be a valid 4-digit year between 1886 and the current year.",
        });
      }

      if (!isNonEmptyString(userData.plateNumber)) {
        errors.push({ field: "plateNumber", message: "Plate number is required." });
      }

      // Display errors
      errors.forEach((error) => {
        displayError(error.field, error.message);
      });

      if (errors.length === 0) {
        axios
          .post("/update-car", userData)
          .then(function (response) {
            alert(response.data);
          })
          .catch(function (error) {
            alert("Error: " + (error.response?.data || error.message));
          });
      }
    });
  });

  setTimeout(() => {
    $("#fetchLicenseData").click();
  }, 20);

  // Search Date Click Handler
  $("#search-appointment-date").on("click", function (event) {
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

        $(".no-slots").addClass("display-none");
        $(".slot-card").addClass("display-none");

        if (data.length > 0) {
          let anySlotAvailable = false;
          data.map((i) => {
            console.log("i=>", i);
            if (i.isTimeSlotAvailable) {
              $(".slots").removeClass("display-none");
              let slot = document.getElementById(i.time);
              slot.classList.remove("display-none");
              anySlotAvailable = true;
            }
          });
          if (!anySlotAvailable)
            $(".no-slots")
              .removeClass("display-none")
              .text("All available slots are booked for this day.");
        } else {
          $(".no-slots").removeClass("display-none");
          $(".slots").addClass("display-none");
        }
      })
      .catch(function (error) {
        alert("Error: " + error.response?.data);
      });
  });

  // Available slot click handler
  $(".slot-available").on("click", function (event) {
    $(".date-time-selected").css("display", "block");
    selectedTime = event.currentTarget.innerText;
    selectedDate = $("#datepicker").datepicker("getDate");

    $(`#selected-date`).text(selectedDate.toDateString());
    $(`#selected-time`).text(selectedTime);
  });

  // Book slot click handler
  $("#book-slot").on("click", function (event) {
    console.log(" selectedDate, selectedTime ", selectedDate, selectedTime);
    axios
      .post("/book-slot", { selectedDate, selectedTime, testType: "G" })
      .then(function (response) {
        alert(response.data.message);
        $(".date-time-selected").css("display", "none");
        window.location.reload();
      })
      .catch(function (error) {
        alert("Error: " + (error.response?.data || error.message));
      });
  });
});
