$(function () {
  let userData = [];
  let selectedUserID;
  let testModal = new bootstrap.Modal(document.getElementById("takeTestModal"));

  const renderTakeTestCTA = (user) =>
    `<button class='btn btn-primary takeTestCTA' data-user-id='${user._id}'>Take Test</button>`;

  const renderTable = (userList) => {
    userData = userList;

    $("#appointmentList").empty();

    userList.map((row) => {
      const dateString = new Date(row.appointment.date).toLocaleDateString();
      $("#appointmentList").append(
        `<tr><td>${row.firstName} ${row.lastName}</td><td>${row.testType}</td><td>${
          row.car_details.plateNumber
        }</td><td>${dateString} - ${row.appointment.time}</td><td>${renderTakeTestCTA(
          row
        )}</td></tr>`
      );
    });
  };

  const getAllCandidates = () => {
    axios
      .get(`/get-candidates/ALL`)
      .then(function (response) {
        let { data } = response;
        renderTable(data);
      })
      .catch(function (error) {
        alert("Error: " + error.response?.data);
      });
  };

  getAllCandidates();

  $("#appointmentFilter").on("change", (e) => {
    console.log("e", e.currentTarget.value);

    const testType = e.currentTarget.value;

    axios
      .get(`/get-candidates/${testType}`)
      .then(function (response) {
        let { data } = response;
        renderTable(data);
      })
      .catch(function (error) {
        alert("Error: " + error.response?.data);
      });
  });

  //   $(".takeTestCTA").on("click", (e) => {
  //     console.log("asd");
  //     let myModal = new bootstrap.Modal(document.getElementById("takeTestModal"));
  //     myModal.show();
  //   });

  $("body").on("click", ".takeTestCTA", function (e) {
    selectedUserID = e.target.dataset.userId;
    const user = userData.find((u) => u._id == selectedUserID);
    const dateString = new Date(user.appointment.date).toLocaleDateString();

    $("#driverName").text(`${user.firstName} ${user.lastName}`);
    $("#testType").text(`${user.testType}`);
    $("#carDetails").text(
      `${user.car_details.year} ${user.car_details.make} ${user.car_details.model}`
    );
    $("#plateDetails").text(`${user.car_details.plateNumber}`);
    $("#testDateTime").text(`${dateString} ${user.appointment.time}`);

    testModal.show();
  });

  $(".submitTestResult").on("click", () => {
    const passed = $("input[name=testResult][value='PASS']").is(":checked");
    const failed = $("input[name=testResult][value='FAIL']").is(":checked");
    console.log("passed", passed);
    console.log("failed", failed);

    if (!passed && !failed) {
      alert("Please Select Test Result");
    }

    const examinerComments = $("#examinerComments").val();
    console.log("examinerComments", examinerComments);

    if (!examinerComments) {
      alert("Please add examiner comments");
    }

    axios
      .post("/take-test", {
        userID: selectedUserID,
        passedTest: passed,
        testComment: examinerComments,
      })
      .then(function (response) {
        console.log(response);
        alert("updated test results");
        testModal.hide();
        //   window.location.href = "/class-g2";
        getAllCandidates();
      })
      .catch(function (error) {
        console.log("response.data", error.response.data);
        alert("Error: " + error.response.data);
      });
  });
});
