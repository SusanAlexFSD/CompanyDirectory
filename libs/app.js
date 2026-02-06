const API_BASE = "https://companydirectory-kday.onrender.com";

// ==================== LOAD PERSONNEL ====================
function loadPersonnelData() {
  $.getJSON(`${API_BASE}/api/personnel`, function (result) {
    if (result.status.code === 200) {
      $("#personnelTableBody").empty();

      result.data.forEach(person => {
        $("#personnelTableBody").append(`
          <tr>
            <td class="align-middle">${person.firstName} ${person.lastName}</td>
            <td class="align-middle d-none d-md-table-cell">${person.departmentName || ""}</td>
            <td class="align-middle d-none d-md-table-cell">${person.locationName || ""}</td>
            <td class="align-middle d-none d-md-table-cell">${person.email}</td>
            <td class="text-end">
              <button class="btn btn-danger btn-sm deletePersonnelBtn" data-id="${person.id}">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>
        `);
      });
    }
  });
}

// ==================== LOAD DEPARTMENTS ====================
function loadDepartmentsData() {
  $.getJSON(`${API_BASE}/api/departments`, function (result) {
    if (result.status.code === 200) {
      $("#departmentTableBody").empty();

      result.data.forEach(dep => {
        $("#departmentTableBody").append(`
          <tr>
            <td class="align-middle">${dep.name}</td>
            <td class="align-middle d-none d-md-table-cell">${dep.locationName || ""}</td>
          </tr>
        `);
      });
    }
  });
}


// ==================== LOAD LOCATIONS ====================
function loadLocationsData() {
  $.getJSON(`${API_BASE}/api/locations`, function (result) {
    if (result.status.code === 200) {
      $("#locationTableBody").empty();

      result.data.forEach(loc => {
        $("#locationTableBody").append(`
          <tr>
            <td class="align-middle">${loc.name}</td>
          </tr>
        `);
      });
    }
  });
}

// ==================== DROPDOWNS ====================
function loadDepartmentDropdown() {
  $.getJSON(`${API_BASE}/api/departments`, function (result) {
    if (result.status.code === 200) {
      const select = $("#addDepartmentID");
      select.empty().append(`<option value="">Select Department</option>`);

      result.data.forEach(dep => {
        select.append(`<option value="${dep.id}">${dep.name}</option>`);
      });
    }
  });
}



function loadLocationDropdown() { 
  $.getJSON(`${API_BASE}/api/locations`, function (result) { 
    if (result.status.code === 200) { 
      const select = $("#addLocation");
      select.empty().append(`<option value="">Select Location</option>`); 

      result.data.forEach(loc => { 
        select.append(`<option value="${loc.id}">${loc.name}</option>`); 
      }); 
    } 
  }); 
}



// ==================== ADD EMPLOYEE ====================
$("#addEmployeeForm").on("submit", function (e) {
  e.preventDefault();

  const employeeData = { 
    firstName: $("#addFirstName").val(), 
    lastName: $("#addLastName").val(), 
    email: $("#addEmail").val(), 
    departmentID: $("#addDepartmentID").val(), 
    locationID: $("#addLocation").val() 
  };


  $.ajax({
    url: `${API_BASE}/api/personnel`,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(employeeData),
    success: function () {
      $("#addEmployeeModal").modal("hide");
      $("#addEmployeeForm")[0].reset();
      loadPersonnelData();
    },
    error: function (err) {
      console.error("Add employee failed:", err);
    }
  });
});

// ==================== SEARCH ====================
$("#searchInp").on("keyup", function () {
  const value = $(this).val().toLowerCase();
  $("tbody tr").filter(function () {
    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
  });
});

// ==================== REFRESH ====================
$("#refreshBtn").click(function () {
  $("#searchInp").val("");
  if ($("#personnelBtn").hasClass("active")) loadPersonnelData();
  if ($("#departmentsBtn").hasClass("active")) loadDepartmentsData();
  if ($("#locationsBtn").hasClass("active")) loadLocationsData();
});

// ==================== TABS ====================
$("#personnelBtn").click(loadPersonnelData);
$("#departmentsBtn").click(loadDepartmentsData);
$("#locationsBtn").click(loadLocationsData);

// ==================== INIT ====================
$(document).ready(function () {
  loadPersonnelData();
  loadDepartmentsData();
  loadLocationsData();
  loadDepartmentDropdown();
  loadLocationDropdown(); 
});



// Delete personnel
$(document).on("click", ".deletePersonnelBtn", function () {
  const id = $(this).data("id");

  if (!confirm("Delete this employee?")) return;

  $.ajax({
    url: `${API_BASE}/api/personnel/${id}`,
    type: "DELETE",
    success: function () {
      loadPersonnelData();
    },
    error: function (err) {
      console.error("Delete failed", err);
    }
  });
});
