const API_BASE = "https://companydirectory-kday.onrender.com";

let personnelCache = [];
let departmentsCache = [];
let locationsCache = [];

let personnelLoaded = false;
let departmentsLoaded = false;
let locationsLoaded = false;

// ==================== HELPERS ====================
function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getActiveTableBody() {
  if ($("#personnelBtn").hasClass("active")) return $("#personnelTableBody");
  if ($("#departmentsBtn").hasClass("active")) return $("#departmentTableBody");
  if ($("#locationsBtn").hasClass("active")) return $("#locationTableBody");
  return $("#personnelTableBody");
}

function applyPersonnelFilters() {
  const selectedDept = $("#filterDepartment").val();
  const selectedLoc = $("#filterLocation").val();
  const searchValue = $("#searchInp").val().toLowerCase();

  $("#personnelTableBody tr").each(function () {
    const dept = $(this).find("td:nth-child(2)").text().trim();
    const loc = $(this).find("td:nth-child(3)").text().trim();
    const text = $(this).text().toLowerCase();

    const deptMatch = !selectedDept || dept === selectedDept;
    const locMatch = !selectedLoc || loc === selectedLoc;
    const searchMatch = !searchValue || text.indexOf(searchValue) > -1;

    $(this).toggle(deptMatch && locMatch && searchMatch);
  });
}

function applyGenericSearch() {
  const value = $("#searchInp").val().toLowerCase();
  const activeTableBody = getActiveTableBody();

  activeTableBody.find("tr").each(function () {
    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
  });
}

// ==================== RENDER PERSONNEL ====================
function renderPersonnelTable(data) {
  let rows = "";

  data.forEach(person => {
    rows += `
      <tr>
        <td class="align-middle">${escapeHtml(person.firstName)} ${escapeHtml(person.lastName)}</td>
        <td class="align-middle d-none d-md-table-cell">${escapeHtml(person.departmentName || "")}</td>
        <td class="align-middle d-none d-md-table-cell">${escapeHtml(person.locationName || "")}</td>
        <td class="align-middle d-none d-md-table-cell">${escapeHtml(person.email || "")}</td>
        <td class="text-end">
          <button class="btn btn-danger btn-sm deletePersonnelBtn" data-id="${escapeHtml(person.id)}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });

  $("#personnelTableBody").html(rows);
  buildPersonnelFilters(data);
  applyPersonnelFilters();
}

function buildPersonnelFilters(data) {
  const deptSet = new Set();
  const locSet = new Set();

  data.forEach(person => {
    if (person.departmentName) deptSet.add(person.departmentName);
    if (person.locationName) locSet.add(person.locationName);
  });

  const deptOptions = ['<option value="">Filter by Department</option>'];
  const locOptions = ['<option value="">Filter by Location</option>'];

  [...deptSet].sort().forEach(dep => {
    deptOptions.push(`<option value="${escapeHtml(dep)}">${escapeHtml(dep)}</option>`);
  });

  [...locSet].sort().forEach(loc => {
    locOptions.push(`<option value="${escapeHtml(loc)}">${escapeHtml(loc)}</option>`);
  });

  const currentDept = $("#filterDepartment").val();
  const currentLoc = $("#filterLocation").val();

  $("#filterDepartment").html(deptOptions.join(""));
  $("#filterLocation").html(locOptions.join(""));

  $("#filterDepartment").val(currentDept);
  $("#filterLocation").val(currentLoc);
}

// ==================== LOAD PERSONNEL ====================
function loadPersonnelData(forceReload = false) {
  if (personnelLoaded && !forceReload) {
    renderPersonnelTable(personnelCache);
    return;
  }

  $.getJSON(`${API_BASE}/api/personnel`, function (result) {
    if (result.status.code === 200) {
      personnelCache = result.data || [];
      personnelLoaded = true;
      renderPersonnelTable(personnelCache);
    }
  }).fail(function (err) {
    console.error("Failed to load personnel:", err);
  });
}

// ==================== RENDER DEPARTMENTS ====================
function renderDepartmentsTable(data) {
  let rows = "";

  data.forEach(dep => {
    rows += `
      <tr>
        <td class="align-middle">${escapeHtml(dep.name)}</td>
        <td class="align-middle d-none d-md-table-cell">${escapeHtml(dep.locationName || "")}</td>
      </tr>
    `;
  });

  $("#departmentTableBody").html(rows);
  applyGenericSearch();
}

// ==================== LOAD DEPARTMENTS ====================
function loadDepartmentsData(forceReload = false) {
  if (departmentsLoaded && !forceReload) {
    renderDepartmentsTable(departmentsCache);
    return;
  }

  $.getJSON(`${API_BASE}/api/departments`, function (result) {
    if (result.status.code === 200) {
      departmentsCache = result.data || [];
      departmentsLoaded = true;
      renderDepartmentsTable(departmentsCache);
    }
  }).fail(function (err) {
    console.error("Failed to load departments:", err);
  });
}

// ==================== RENDER LOCATIONS ====================
function renderLocationsTable(data) {
  let rows = "";

  data.forEach(loc => {
    rows += `
      <tr>
        <td class="align-middle">${escapeHtml(loc.name)}</td>
      </tr>
    `;
  });

  $("#locationTableBody").html(rows);
  applyGenericSearch();
}

// ==================== LOAD LOCATIONS ====================
function loadLocationsData(forceReload = false) {
  if (locationsLoaded && !forceReload) {
    renderLocationsTable(locationsCache);
    return;
  }

  $.getJSON(`${API_BASE}/api/locations`, function (result) {
    if (result.status.code === 200) {
      locationsCache = result.data || [];
      locationsLoaded = true;
      renderLocationsTable(locationsCache);
    }
  }).fail(function (err) {
    console.error("Failed to load locations:", err);
  });
}

// ==================== DROPDOWNS ====================
function populateDepartmentDropdown() {
  const options = ['<option value="">Select Department</option>'];

  departmentsCache.forEach(dep => {
    options.push(
      `<option value="${escapeHtml(dep.id)}">${escapeHtml(dep.name)}</option>`
    );
  });

  $("#addDepartmentID").html(options.join(""));
}

function populateLocationDropdown() {
  const options = ['<option value="">Select Location</option>'];

  locationsCache.forEach(loc => {
    options.push(
      `<option value="${escapeHtml(loc.id)}">${escapeHtml(loc.name)}</option>`
    );
  });

  $("#addLocation").html(options.join(""));
}

function loadDepartmentDropdown() {
  if (departmentsLoaded) {
    populateDepartmentDropdown();
    return;
  }

  $.getJSON(`${API_BASE}/api/departments`, function (result) {
    if (result.status.code === 200) {
      departmentsCache = result.data || [];
      departmentsLoaded = true;
      populateDepartmentDropdown();
    }
  }).fail(function (err) {
    console.error("Failed to load department dropdown:", err);
  });
}

function loadLocationDropdown() {
  if (locationsLoaded) {
    populateLocationDropdown();
    return;
  }

  $.getJSON(`${API_BASE}/api/locations`, function (result) {
    if (result.status.code === 200) {
      locationsCache = result.data || [];
      locationsLoaded = true;
      populateLocationDropdown();
    }
  }).fail(function (err) {
    console.error("Failed to load location dropdown:", err);
  });
}

// ==================== FILTER LOGIC ====================
$("#filterDepartment, #filterLocation").on("change", function () {
  applyPersonnelFilters();
});

// ==================== APPLY BUTTON (FILTER MODAL) ====================
$("#filterForm button").on("click", function (e) {
  e.preventDefault();
  applyPersonnelFilters();
  $("#filterModal").modal("hide");
});

// ==================== ADD EMPLOYEE ====================
$("#addEmployeeForm").on("submit", function (e) {
  e.preventDefault();

  const employeeData = {
    firstName: $("#addFirstName").val().trim(),
    lastName: $("#addLastName").val().trim(),
    email: $("#addEmail").val().trim(),
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
      loadPersonnelData(true);
    },
    error: function (err) {
      console.error("Add employee failed:", err);
    }
  });
});

// ==================== SEARCH ====================
$("#searchInp").on("keyup", function () {
  if ($("#personnelBtn").hasClass("active")) {
    applyPersonnelFilters();
  } else {
    applyGenericSearch();
  }
});

// ==================== REFRESH ====================
$("#refreshBtn").click(function () {
  $("#searchInp").val("");
  $("#filterDepartment").val("");
  $("#filterLocation").val("");

  if ($("#personnelBtn").hasClass("active")) loadPersonnelData(true);
  if ($("#departmentsBtn").hasClass("active")) loadDepartmentsData(true);
  if ($("#locationsBtn").hasClass("active")) loadLocationsData(true);
});

// ==================== TABS ====================
$("#personnelBtn").click(function () {
  loadPersonnelData();
});

$("#departmentsBtn").click(function () {
  loadDepartmentsData();
});

$("#locationsBtn").click(function () {
  loadLocationsData();
});

// ==================== LOAD DROPDOWNS ONLY WHEN MODAL OPENS ====================
$("#addEmployeeModal").on("show.bs.modal", function () {
  loadDepartmentDropdown();
  loadLocationDropdown();
});

// ==================== INIT ====================
$(document).ready(function () {
  loadPersonnelData();
});

// ==================== DELETE PERSONNEL ====================
$(document).on("click", ".deletePersonnelBtn", function () {
  const id = $(this).data("id");

  if (!confirm("Delete this employee?")) return;

  $.ajax({
    url: `${API_BASE}/api/personnel/${id}`,
    type: "DELETE",
    success: function () {
      loadPersonnelData(true);
    },
    error: function (err) {
      console.error("Delete failed:", err);
    }
  });
});