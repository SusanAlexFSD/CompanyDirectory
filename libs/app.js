// LOAD PERSONNEL TABLE

// LOAD THE SQL DATABASE TABLES

// LOAD PERSONNEL TABLE
function loadPersonnelData() {
    $.ajax({
        url: "php/loadPersonnel.php",
        type: "GET",
        dataType: "json",
        success: function(result) {
            if (result.status.code == 200) {
                $("#personnelTableBody").empty();
                result.data.forEach(function(person) {
                    let row = `
                        <tr>
                            <td class="align-middle text-nowrap">${person.firstName}, ${person.lastName}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.departmentID}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.locationID}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
                            <td class="text-end text-nowrap">
                                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${person.id}">
                                    <i class="fa-solid fa-pencil fa-fw"></i>
                                </button>
                                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deletePersonnelModal" data-id="${person.id}">
                                    <i class="fa-solid fa-trash fa-fw"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    $("#personnelTableBody").append(row);
                });
            } else {
                console.error("Error fetching personnel data");
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("AJAX error: " + textStatus);
            console.error('Error fetching data:', textStatus, errorThrown);
            console.log('Response:', jqXHR.responseText); 
        }
    });
}

// Call this function on page load or when the personnel tab is clicked
$(document).ready(function() {
    loadPersonnelData();
});



// LOAD DEPARTMENT TABLE

function loadDepartmentsData() {
    $.ajax({
        url: "php/loadDepartments.php",
        method: 'GET',
        dataType: 'text',
        success: function(response) {
            try {
                const jsonResponse = response.substring(response.indexOf("{"));
                const data = JSON.parse(jsonResponse);
  
                let departmentTableBody = $('#departmentTableBody');
                let locationTableBody = $('#locationTableBody');
                departmentTableBody.empty();
                locationTableBody.empty();
  
                let locations = new Set();
                let uniqueDepartments = new Set(); // Track unique department names
  
                data.data.forEach(department => {
                    let departmentName = department.department.trim(); // Normalize department name
                    let location = department.location && department.location.trim(); // Normalize location
  
                    // Add location to the Set for locations
                    if (location) {
                        locations.add(location);
                    }
  
                    // Check if this department has already been added
                    if (!uniqueDepartments.has(departmentName.toLowerCase())) {
                        uniqueDepartments.add(departmentName.toLowerCase()); // Add department to Set
  
                        let departmentRow = `<tr>
                            <td class="align-middle text-nowrap">${departmentName}</td>
                            <td class="align-middle text-nowrap d-none d-md-table-cell">${location}</td>
                            <td class="align-middle text-end text-nowrap">
                                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.department}">
                                    <i class="fa-solid fa-pencil fa-fw"></i>
                                </button>
                                <button type="button" class="btn btn-primary btn-sm deleteDepartmentBtn" data-id="${department.department}">
                                    <i class="fa-solid fa-trash fa-fw"></i>
                                </button>
                            </td>
                        </tr>`;
  
                        departmentTableBody.append(departmentRow); // Append only unique departments
                    }
                });
  
                // Add location rows (without duplication)
                locations.forEach(location => {
                    let locationRow = `<tr>
                        <td class="align-middle text-nowrap">${location}</td>
                        <td class="text-end text-nowrap">
                            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${location}">
                                <i class="fa-solid fa-pencil fa-fw"></i>
                            </button>
                            <button type="button" class="btn btn-primary btn-sm deleteLocationBtn" data-id="${location}">
                                <i class="fa-solid fa-trash fa-fw"></i>
                            </button>
                        </td>
                    </tr>`;
                    locationTableBody.append(locationRow);
                });
  
            } catch (e) {
                console.error('Error parsing JSON:', e);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching departments:', textStatus, errorThrown);
            console.error('Response:', jqXHR.responseText);
            console.error('Status:', jqXHR.status);
        }
    });
  }


// LOAD LOCATIONS TABLE

function loadLocationsData() {
    $.ajax({
        url: "php/loadLocations.php",
        type: "GET",
        dataType: "json",
        success: function(result) {
            if (result.status.code == 200) {
                let locationTableBody = $('#locationTableBody');
                locationTableBody.empty();

                result.data.forEach(location => {
                    let locationRow = `<tr>
                        <td class="align-middle text-nowrap">${location.name}</td>
                        <td class="text-end text-nowrap">
                            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${location.id}">
                                <i class="fa-solid fa-pencil fa-fw"></i>
                            </button>
                            <button type="button" class="btn btn-primary btn-sm deleteLocationBtn" data-id="${location.id}">
                                <i class="fa-solid fa-trash fa-fw"></i>
                            </button>
                        </td>
                    </tr>`;
                    locationTableBody.append(locationRow);
                });
            } else {
                console.error("Error fetching location data");
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching locations:', textStatus);
            console.error('Error fetching data:', textStatus, errorThrown);
            console.log('Response:', jqXHR.responseText); 
        }
    });
}

// Call both functions on page load or when needed
$(document).ready(function() {
    loadDepartmentsData();
    loadLocationsData();
});


// LOAD DEPARTMENT & LOCATION IN DROP DOWN MENUS 


function loadDepartmentAndLocationOptions() {
    $.ajax({
        url: "php/loadDepartments.php",
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            try {
                let departments = new Set();
                let locations = new Set();

                response.data.forEach(item => {
                    if (item.department) departments.add(item.department);
                    if (item.location) locations.add(item.location.trim());
                });

                // Populate department dropdown
                let departmentSelect = $('#addDepartment');
                departmentSelect.empty().append('<option value="">Select Department</option>');
                Array.from(departments).forEach(dept => {
                    departmentSelect.append(`<option value="${dept}">${dept}</option>`);
                });

                // Populate location dropdown
                let locationSelect = $('#addLocation');  // Add the location dropdown in your modal form if not done yet
                locationSelect.empty().append('<option value="">Select Location</option>');
                Array.from(locations).forEach(loc => {
                    locationSelect.append(`<option value="${loc}">${loc}</option>`);
                });

            } catch (e) {
                console.error('Error parsing departments/locations:', e);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching departments/locations:', textStatus, errorThrown);
        }
    });
}


// SEARCH BAR FUNCTION


$("#searchInp").on("keyup", function() {
    var searchValue = $(this).val().toLowerCase();

    // Search Personnel Table
    $("#personnelTableBody tr").each(function() {
        var rowText = $(this).text().toLowerCase();
        $(this).toggle(rowText.indexOf(searchValue) > -1);
    });

    // Search Departments Table
    $("#departmentTableBody tr").each(function() {
        var rowText = $(this).text().toLowerCase();
        $(this).toggle(rowText.indexOf(searchValue) > -1);
    });

    // Search Locations Table
    $("#locationTableBody tr").each(function() {
        var rowText = $(this).text().toLowerCase();
        $(this).toggle(rowText.indexOf(searchValue) > -1);
    });
});

// REFRESH BUTTON FUNCTION

$("#refreshBtn").click(function() {
    $("#searchInp").val('');

    // Check which tab is active and refresh the corresponding table
    if ($("#personnelBtn").hasClass("active")) {
        loadPersonnelData();
    } else if ($("#departmentsBtn").hasClass("active")) {
        loadDepartmentsData();
    } else if ($("#locationsBtn").hasClass("active")) {
        loadLocationsData();
    }
});

// FILTER BUTTON FUNCTION

function loadFilterOptions() {
    $.ajax({
        url: "php/loadDepartments.php",
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            try {
                let departments = new Set();
                let locations = new Set();

                response.data.forEach(item => {
                    if (item.department) departments.add(item.department);
                    if (item.location) locations.add(item.location.trim());
                });

                let departmentSelect = $('#filterDepartment');
                departmentSelect.empty().append('<option value="">All Departments</option>');
                Array.from(departments).forEach(dept => departmentSelect.append(`<option value="${dept}">${dept}</option>`));

                let locationSelect = $('#filterLocation');
                locationSelect.empty().append('<option value="">All Locations</option>');
                Array.from(locations).forEach(loc => locationSelect.append(`<option value="${loc}">${loc}</option>`));

            } catch (e) {
                console.error('Error parsing filter options:', e);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching departments:', textStatus, errorThrown);
            console.error('Error fetching data:', textStatus, errorThrown);
            console.log('Response:', jqXHR.responseText); 
        }
    });
}

$(document).ready(function() {
    loadFilterOptions();
});

// Show filter modal and populate options
$("#filterBtn").click(function() {
    loadFilterOptions();
    $('#filterModal').modal('show');
});

// Apply filters when form is submitted
$("#filterForm").on("submit", function(e) {
    e.preventDefault();
    let selectedDepartments = $("#filterDepartment").val() || '';
    let selectedLocations = $("#filterLocation").val() || '';

    $("#personnelTableBody tr").each(function() {
        let rowDept = $(this).find("td:eq(1)").text().trim();
        let rowLoc = $(this).find("td:eq(2)").text().trim();

        let showRow = (selectedDepartments === "" || rowDept === selectedDepartments) &&
                      (selectedLocations === "" || rowLoc === selectedLocations);

        $(this).toggle(showRow);
    });

    $('#filterModal').modal('hide');
});

// ADD EMPLOYEE FUNCTION

$("#addEmployeeForm").on("submit", function(e) {
    e.preventDefault(); // Prevents form from submitting the traditional way

    var employeeData = {
        firstName: $("#addFirstName").val(),
        lastName: $("#addLastName").val(),
        email: $("#addEmail").val(),
        departmentID: $("#addDepartment").val(),
        locationID: $("#addLocation").val()
    };
    

    console.log("Employee Data:", employeeData); // Verify data here

    $.ajax({
        url: "php/insertEmployee.php",
        type: "POST",
        data: employeeData,
        dataType: "json",
        success: function(response) {
            if (response.status.code === 200) {
                loadPersonnelData(); // Refresh personnel data
                $('#addEmployeeModal').modal('hide'); // Close modal
                $("#addEmployeeForm")[0].reset(); // Reset form
            } else {
                console.error("Error adding employee:", response.status.description);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("AJAX error:", textStatus);
            console.log('Response:', jqXHR.responseText);
        }
    });
    });




// Open Add Employee Modal
$("#addBtn").click(function() {
    loadDepartmentAndLocationOptions();
    $('#addEmployeeModal').modal('show');
});

$("#addEmployeeForm button[type='submit']").click(function() {
    console.log("Submit button clicked");
});


// Tab Activation
$("#personnelBtn").click(function() {
    $(this).addClass("active");
    $("#departmentsBtn, #locationsBtn").removeClass("active");
    loadPersonnelData();
});

$("#departmentsBtn").click(function() {
    $(this).addClass("active");
    $("#personnelBtn, #locationsBtn").removeClass("active");
    loadDepartmentsData();
});

$("#locationsBtn").click(function() {
    $(this).addClass("active");
    $("#personnelBtn, #departmentsBtn").removeClass("active");
    loadLocationsData();
});

// EDIT PERSONNEL FUNCTION

$("#editPersonnelModal").on("show.bs.modal", function(e) {
    $.ajax({
        url: "php/getPersonnelById.php",
        type: "POST",
        dataType: "json",
        data: { id: $(e.relatedTarget).attr("data-id") },
        success: function(result) {
            if (result.status.code == 200) {
                let personnel = result.data.personnel[0];
                $("#editPersonnelEmployeeID").val(personnel.id);
                $("#editPersonnelFirstName").val(personnel.firstName);
                $("#editPersonnelLastName").val(personnel.lastName);
                $("#editPersonnelJobTitle").val(personnel.jobTitle);
                $("#editPersonnelEmailAddress").val(personnel.email);
                
                // Load Departments for Edit
                loadDepartmentsForEdit(personnel.departmentID);
            } else {
                $("#editPersonnelModal .modal-title").text("Error retrieving data");
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $("#editPersonnelModal .modal-title").text("Error retrieving data");
            console.error('Error fetching data:', textStatus, errorThrown);
            console.log('Response:', jqXHR.responseText); 
        }
    });
});

// Function to load departments for the edit modal
function loadDepartmentsForEdit(selectedDepartment) {
    $.ajax({
        url: "php/loadDepartments.php",
        type: "GET",
        dataType: "json",
        success: function(result) {
            if (result.status.code == 200) {
                $("#editPersonnelDepartment").empty();
                $.each(result.data, function() {
                    $("#editPersonnelDepartment").append(
                        $("<option>", {
                            value: this.id,
                            text: this.name
                        })
                    );
                });
                $("#editPersonnelDepartment").val(selectedDepartment);
            }
        }
    });
}

// Execute when the form button with type="submit" is clicked
$("#editPersonnelForm").on("submit", function(e) {
    e.preventDefault();
    // AJAX call to save form data
});

// EDIT DEPARTMENT FUNCTION

// EDIT LOCATIONS FUNCTION

// DELETE EMPLOYEE FUNCTION 

// DELETE DEPARTMENT FUNCTION

// DELETE LOCATIONS FUNCTION 