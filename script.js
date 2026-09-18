/**
 * ============================================================================
 * SMART EMERGENCY RESPONSE (SER) - CORE APPLICATION JAVASCRIPT
 * Tagline: Report. Respond. Protect.
 * 100% Client-Side / Static Architecture (GitHub Pages Compatible)
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. CONSTANTS & CONFIGURATION
  // --------------------------------------------------------------------------
  const STORAGE_KEY_INCIDENTS = 'ser_incidents_v2';
  const STORAGE_KEY_THEME = 'ser_theme_pref';
  const DEFAULT_MAP_CENTER = [28.6139, 77.2090]; // New Delhi coordinates as default reference
  const DEFAULT_MAP_ZOOM = 13;

  // Status workflow stages in exact order
  const STATUS_STAGES = [
    'Reported',
    'Under Review',
    'Verified',
    'Assigned',
    'Response In Progress',
    'Resolved'
  ];

  // Realistic Initial Demo Incidents (Clearly identified as demo)
  const INITIAL_DEMO_INCIDENTS = [
    {
      id: 'SER-2026-10482',
      title: 'Commercial Complex 3rd Floor Fire',
      category: 'Fire Emergency',
      severity: 'Critical',
      affected: 6,
      danger: 'Yes',
      location: 'Sector 4 Metro Arcade, Inner Ring',
      lat: 28.6139,
      lng: 77.2090,
      contact: '+91 98111 22334',
      reporterName: 'Sunil Verma (Building Guard)',
      description: 'Heavy black smoke billowing from electrical switch room on 3rd floor. Building alarm triggered. Multiple staff moving toward fire exit stairs.',
      priority: 'Critical',
      priorityReason: 'Immediate danger to life and 6 people affected.',
      status: 'Response In Progress',
      timestamp: '2026-09-18 10:15 AM',
      image: 'assets/images/demo_fire_1.jpg',
      notes: 'Fire Tender Unit F-04 and Aerial Ladder F-09 on-scene. Evacuation ongoing.'
    },
    {
      id: 'SER-2026-10483',
      title: 'Multi-Vehicle Collision on Flyover',
      category: 'Road Accident',
      severity: 'High',
      affected: 3,
      danger: 'Yes',
      location: 'Expressway Flyover near Pillar 42',
      lat: 28.6250,
      lng: 77.2180,
      contact: '+91 98222 33445',
      reporterName: 'Ananya Sharma',
      description: 'Sedan collided with delivery truck. Front vehicle overturned, blocking two central lanes. Fuel leakage detected on asphalt.',
      priority: 'Critical',
      priorityReason: 'Active life danger and highway traffic hazard.',
      status: 'Assigned',
      timestamp: '2026-09-18 10:45 AM',
      image: 'assets/images/demo_accident_1.jpg',
      notes: 'Highway Police Patrol P-09 securing perimeter. Paramedic ALS-2 en route.'
    },
    {
      id: 'SER-2026-10484',
      title: 'High-Voltage Transformer Sparking & Cable Snap',
      category: 'Electrical Emergency',
      severity: 'High',
      affected: 1,
      danger: 'No',
      location: 'Market Road Cross, Near Substation 2',
      lat: 28.6080,
      lng: 77.2250,
      contact: '+91 98333 44556',
      reporterName: 'Ramesh K.',
      description: 'Street transformer emitting loud humming and sparks. Live dangling cable hanging approximately 7 feet over pedestrian pavement.',
      priority: 'High',
      priorityReason: 'High severity threat; hazard requires urgent power isolation.',
      status: 'Verified',
      timestamp: '2026-09-18 11:20 AM',
      image: 'assets/images/demo_electric_1.jpg',
      notes: 'Grid control room alerted to de-energize feeder line 3.'
    },
    {
      id: 'SER-2026-10485',
      title: 'Senior Citizen Cardiac Collapse',
      category: 'Medical Emergency',
      severity: 'Critical',
      affected: 1,
      danger: 'Yes',
      location: 'Central Railway Station Platform 2 Concourse',
      lat: 28.6200,
      lng: 77.2050,
      contact: '+91 98444 55667',
      reporterName: 'Rajesh Nair',
      description: '65-year-old male collapsed suddenly, unresponsive with faint pulse. Station bystander started chest compressions.',
      priority: 'Critical',
      priorityReason: 'Immediate danger reported (Cardiopulmonary event).',
      status: 'Resolved',
      timestamp: '2026-09-18 09:30 AM',
      image: '',
      notes: 'Station AED utilized. Patient transported to Apex Trauma Center in stable condition.'
    },
    {
      id: 'SER-2026-10486',
      title: 'Roadway Cavity / Sinkhole Formation',
      category: 'Infrastructure Hazard',
      severity: 'Medium',
      affected: 0,
      danger: 'No',
      location: 'North Boulevard Service Road, Near Bus Shelter',
      lat: 28.6300,
      lng: 77.2300,
      contact: '',
      reporterName: 'Anonymous Citizen',
      description: 'Water pipeline burst created a 4-foot deep cavity on asphalt. Two-wheelers at risk of dropping into depression.',
      priority: 'Medium',
      priorityReason: 'Medium urgency; infrastructure failure requiring barrier setup.',
      status: 'Under Review',
      timestamp: '2026-09-18 11:40 AM',
      image: 'assets/images/demo_sinkhole_1.jpg',
      notes: 'Civil emergency maintenance team dispatched with barricade tape.'
    }
  ];

  // Pre-mapped Official Emergency Stations for Map Markers
  const EMERGENCY_STATIONS = [
    { name: 'City Trauma & General Hospital', type: 'hospital', lat: 28.6180, lng: 77.2140, phone: '108', address: 'Connaught Medical Center, Gate 2', status: '24/7 Casualty Ready' },
    { name: 'District Civil Hospital', type: 'hospital', lat: 28.6050, lng: 77.2020, phone: '102', address: 'South Avenue Medical Wing', status: 'ICU & Blood Bank Available' },
    { name: 'Central Fire & Disaster Rescue Station', type: 'fire', lat: 28.6110, lng: 77.2180, phone: '101', address: 'Fire Station Road, Brigade HQ', status: '5 Units on Standby' },
    { name: 'Sector 8 Industrial Fire Outpost', type: 'fire', lat: 28.6270, lng: 77.2060, phone: '101', address: 'Industrial Ring Hub', status: 'Hazmat Vehicle Available' },
    { name: 'Metropolitan Police Headquarters', type: 'police', lat: 28.6160, lng: 77.2070, phone: '100', address: 'Parliament Street Safety Desk', status: 'Patrol Squads Active' },
    { name: 'Civil Lines Police Station', type: 'police', lat: 28.6290, lng: 77.2240, phone: '112', address: 'North Civic Square', status: 'Quick Response Team Ready' }
  ];

  // Global App State
  let appState = {
    incidents: [],
    currentTheme: 'light',
    map: null,
    mapMarkers: [],
    userLocationMarker: null,
    activeMapFilter: 'all',
    charts: {
      category: null,
      status: null,
      trend: null
    },
    uploadedImageBase64: ''
  };

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION ROUTINE
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initStorage();
    initNavbar();
    initPriorityEngine();
    initImageUpload();
    initReportingForm();
    initLeafletMap();
    initCharts();
    initTracking();
    initDispatchCenter();
    initSafetySearch();
    initContactForm();
    initQuickActions();

    // Trigger initial UI update
    renderAllViews();
  });

  // --------------------------------------------------------------------------
  // 3. THEME MANAGER (DARK / LIGHT MODE)
  // --------------------------------------------------------------------------
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
    } else {
      setTheme('light');
    }

    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const nextTheme = appState.currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        showToast('Theme Changed', `Switched to ${nextTheme} mode`, 'info');
      });
    }
  }

  function setTheme(theme) {
    appState.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);

    const icon = document.getElementById('themeToggleIcon');
    if (icon) {
      if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun text-warning';
      } else {
        icon.className = 'fa-solid fa-moon text-dark';
      }
    }

    // Refresh charts if already initialized to match text colors
    if (appState.charts.category) {
      updateChartsTheme();
    }
  }

  // --------------------------------------------------------------------------
  // 4. STORAGE & DATA SEEDING
  // --------------------------------------------------------------------------
  function initStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_INCIDENTS);
      if (raw) {
        appState.incidents = JSON.parse(raw);
      } else {
        appState.incidents = [...INITIAL_DEMO_INCIDENTS];
        saveIncidents();
      }
    } catch (e) {
      console.warn('LocalStorage error or unavailable, falling back to in-memory store:', e);
      appState.incidents = [...INITIAL_DEMO_INCIDENTS];
    }
  }

  function saveIncidents() {
    try {
      localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(appState.incidents));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  // --------------------------------------------------------------------------
  // 5. NAVBAR SCROLL & ACTIVE LINK HANDLERS
  // --------------------------------------------------------------------------
  function initNavbar() {
    const navbar = document.getElementById('serNavbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    });

    // Close mobile collapse on link click
    const navLinks = document.querySelectorAll('.nav-link');
    const navCollapse = document.getElementById('navbarNav');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navCollapse && navCollapse.classList.contains('show')) {
          const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
          if (bsCollapse) bsCollapse.hide();
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 6. SMART PRIORITY ENGINE (PURE JAVASCRIPT RULE-BASED)
  // --------------------------------------------------------------------------
  function calculatePriority(severity, dangerYesNo, affectedCount) {
    const affected = parseInt(affectedCount, 10) || 0;
    const isDanger = dangerYesNo === 'Yes';

    // Priority Engine Rules
    if (severity === 'Critical' || isDanger || affected >= 5) {
      let reason = 'Immediate threat to human life';
      if (severity === 'Critical' && isDanger) {
        reason = 'Critical severity and active life hazard reported.';
      } else if (isDanger) {
        reason = 'Immediate danger to human life reported.';
      } else if (affected >= 5) {
        reason = `Large casualty impact potential (${affected} individuals affected).`;
      } else {
        reason = 'Critical severity level declared by reporter.';
      }
      return {
        level: 'Critical',
        cssClass: 'p-critical',
        badgeHtml: '<i class="fa-solid fa-circle-radiation text-danger me-1"></i> Critical Priority',
        reason: reason
      };
    }

    if (severity === 'High' || affected >= 3) {
      let reason = 'High urgency situation';
      if (affected >= 3) {
        reason = `Multiple (${affected}) individuals affected requiring escalated dispatch.`;
      } else {
        reason = 'High hazard level requiring swift responder intervention.';
      }
      return {
        level: 'High',
        cssClass: 'p-high',
        badgeHtml: '<i class="fa-solid fa-triangle-exclamation text-warning me-1"></i> High Priority',
        reason: reason
      };
    }

    if (severity === 'Medium') {
      return {
        level: 'Medium',
        cssClass: 'p-medium',
        badgeHtml: '<i class="fa-solid fa-circle-exclamation text-warning me-1"></i> Medium Priority',
        reason: 'Standard urgent assistance needed without immediate casualty threat.'
      };
    }

    return {
      level: 'Low',
      cssClass: 'p-low',
      badgeHtml: '<i class="fa-solid fa-circle-check text-success me-1"></i> Low Priority',
      reason: 'Non-critical civic advisory; queued for standard priority patrol.'
    };
  }

  function initPriorityEngine() {
    const severityInput = document.getElementById('reportSeverity');
    const affectedInput = document.getElementById('reportAffected');
    const dangerInputs = document.querySelectorAll('input[name="immediateDanger"]');

    const updatePreview = () => {
      const severity = severityInput?.value || 'Medium';
      const affected = affectedInput?.value || 1;
      let danger = 'No';
      dangerInputs.forEach(radio => {
        if (radio.checked) danger = radio.value;
      });

      const priority = calculatePriority(severity, danger, affected);
      const badge = document.getElementById('priorityBadgeDisplay');
      const text = document.getElementById('priorityTextDisplay');
      const reason = document.getElementById('priorityReasonDisplay');

      if (badge && text && reason) {
        badge.className = `priority-badge-live ${priority.cssClass}`;
        badge.innerHTML = priority.badgeHtml;
        reason.textContent = `Reason: ${priority.reason}`;
      }
    };

    severityInput?.addEventListener('change', updatePreview);
    affectedInput?.addEventListener('input', updatePreview);
    dangerInputs.forEach(r => r.addEventListener('change', updatePreview));

    // Run once initially
    updatePreview();
  }

  // --------------------------------------------------------------------------
  // 7. IMAGE UPLOAD HANDLING & PREVIEW
  // --------------------------------------------------------------------------
  function initImageUpload() {
    const fileInput = document.getElementById('reportImage');
    const dropzone = document.getElementById('uploadDropzone');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewThumb = document.getElementById('imagePreviewThumb');
    const previewName = document.getElementById('imagePreviewName');
    const previewSize = document.getElementById('imagePreviewSize');
    const btnClear = document.getElementById('btnClearImage');

    if (!fileInput) return;

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate File Size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image Too Large', 'Maximum allowed image upload size is 2MB.', 'danger');
        fileInput.value = '';
        return;
      }

      // Validate File Type
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type)) {
        showToast('Invalid Format', 'Please upload JPG, PNG, or WEBP images only.', 'danger');
        fileInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        appState.uploadedImageBase64 = event.target.result;
        if (previewThumb) previewThumb.src = event.target.result;
        if (previewName) previewName.textContent = file.name;
        if (previewSize) previewSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;

        dropzone?.classList.add('d-none');
        previewContainer?.classList.remove('d-none');
        showToast('Photo Attached', 'Incident preview image uploaded successfully.', 'success');
      };
      reader.readAsDataURL(file);
    });

    btnClear?.addEventListener('click', () => {
      fileInput.value = '';
      appState.uploadedImageBase64 = '';
      dropzone?.classList.remove('d-none');
      previewContainer?.classList.add('d-none');
    });
  }

  // --------------------------------------------------------------------------
  // 8. EMERGENCY REPORTING FORM & GEOLOCATION
  // --------------------------------------------------------------------------
  function initReportingForm() {
    const form = document.getElementById('emergencyReportForm');
    const btnLocate = document.getElementById('btnUseMyLocation');
    const locationInput = document.getElementById('reportLocation');
    const latInput = document.getElementById('reportLat');
    const lngInput = document.getElementById('reportLng');
    const geoText = document.getElementById('geoCoordsText');

    // Geolocation Helper
    btnLocate?.addEventListener('click', () => {
      if (!navigator.geolocation) {
        showToast('Geolocation Unavailable', 'Your browser does not support GPS location.', 'warning');
        return;
      }

      btnLocate.classList.add('locating');
      btnLocate.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Detecting GPS...';

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          latInput.value = lat;
          lngInput.value = lng;
          geoText.innerHTML = `<span class="text-success"><i class="fa-solid fa-circle-check"></i> GPS Fixed: ${lat.toFixed(4)}, ${lng.toFixed(4)}</span>`;

          if (!locationInput.value.trim()) {
            locationInput.value = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          }

          btnLocate.classList.remove('locating');
          btnLocate.innerHTML = '<i class="fa-solid fa-check text-success"></i> Located';

          // Center map if available
          if (appState.map) {
            appState.map.setView([lat, lng], 15);
            addOrUpdateUserLocationMarker(lat, lng);
          }

          showToast('GPS Location Detected', `Coordinates locked: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'success');
        },
        (error) => {
          btnLocate.classList.remove('locating');
          btnLocate.innerHTML = '<i class="fa-solid fa-crosshairs"></i> Use My Location';
          let msg = 'Could not retrieve GPS position. Please enter your location manually.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission was denied. Please enter your address manually.';
          }
          showToast('Location Notice', msg, 'warning');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });

    // Form Submission
    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        showToast('Required Fields Missing', 'Please fill in all mandatory fields highlighted in red.', 'danger');
        return;
      }

      const category = document.getElementById('reportCategory').value;
      const severity = document.getElementById('reportSeverity').value;
      const title = document.getElementById('reportTitle').value.trim();
      const description = document.getElementById('reportDescription').value.trim();
      const affected = parseInt(document.getElementById('reportAffected').value, 10) || 1;
      const danger = document.querySelector('input[name="immediateDanger"]:checked')?.value || 'No';
      const location = locationInput.value.trim();
      const contact = document.getElementById('reportContact').value.trim();
      const reporterName = document.getElementById('reportName').value.trim() || 'Anonymous Citizen';

      let lat = parseFloat(latInput.value);
      let lng = parseFloat(lngInput.value);

      // If no GPS was captured, generate a small offset near default coordinates so it can render on map
      if (isNaN(lat) || isNaN(lng)) {
        lat = DEFAULT_MAP_CENTER[0] + (Math.random() - 0.5) * 0.04;
        lng = DEFAULT_MAP_CENTER[1] + (Math.random() - 0.5) * 0.04;
      }

      // Compute priority
      const priorityObj = calculatePriority(severity, danger, affected);

      // Generate Unique Incident ID (e.g. SER-2026-XXXXX)
      const incidentId = generateUniqueIncidentId();

      // Timestamp
      const now = new Date();
      const timestamp = now.toISOString().replace('T', ' ').substring(0, 16);

      const newIncident = {
        id: incidentId,
        title: title,
        category: category,
        severity: severity,
        affected: affected,
        danger: danger,
        location: location,
        lat: lat,
        lng: lng,
        contact: contact,
        reporterName: reporterName,
        description: description,
        priority: priorityObj.level,
        priorityReason: priorityObj.reason,
        status: 'Reported',
        timestamp: timestamp,
        image: appState.uploadedImageBase64 || '',
        notes: 'Incident automatically queued. Emergency dispatch center notified.'
      };

      // Add to front of array & persist
      appState.incidents.unshift(newIncident);
      saveIncidents();

      // Clear Form
      form.reset();
      form.classList.remove('was-validated');
      document.getElementById('btnClearImage')?.click();
      geoText.textContent = 'GPS Coordinates: Not detected';
      latInput.value = '';
      lngInput.value = '';
      btnLocate.innerHTML = '<i class="fa-solid fa-crosshairs"></i> Use My Location';

      // Update all reactive components
      renderAllViews();

      // Show Success Modal
      showSubmissionSuccessModal(newIncident);

      // Toast Notification
      showToast('Emergency Report Submitted', `Incident ${incidentId} registered. Dispatch status: Reported.`, 'success');
    });
  }

  function generateUniqueIncidentId() {
    let id;
    let exists = true;
    while (exists) {
      const randNum = Math.floor(10000 + Math.random() * 90000);
      id = `SER-2026-${randNum}`;
      exists = appState.incidents.some(inc => inc.id === id);
    }
    return id;
  }

  function showSubmissionSuccessModal(incident) {
    const modalEl = document.getElementById('reportSuccessModal');
    if (!modalEl) return;

    document.getElementById('modalIncidentId').textContent = incident.id;
    document.getElementById('modalCategory').textContent = incident.category;
    document.getElementById('modalPriority').textContent = incident.priority;
    document.getElementById('modalTimestamp').textContent = incident.timestamp;

    const copyBtn = document.getElementById('btnCopyIncidentId');
    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(incident.id).then(() => {
          showToast('Copied to Clipboard', `Incident ID ${incident.id} copied!`, 'info');
        });
      };
    }

    const trackBtn = document.getElementById('btnTrackThisIncident');
    if (trackBtn) {
      trackBtn.onclick = () => {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();

        // Scroll to track section and search
        const trackSection = document.getElementById('track-section');
        trackSection?.scrollIntoView({ behavior: 'smooth' });

        const trackInput = document.getElementById('trackIncidentId');
        if (trackInput) {
          trackInput.value = incident.id;
          performTrackSearch(incident.id);
        }
      };
    }

    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }

  // --------------------------------------------------------------------------
  // 9. QUICK ACTIONS HANDLER
  // --------------------------------------------------------------------------
  function initQuickActions() {
    const cards = document.querySelectorAll('.quick-action-card');
    const categorySelect = document.getElementById('reportCategory');
    const reportSection = document.getElementById('report-section');

    cards.forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.getAttribute('data-category');
        if (categorySelect && cat) {
          categorySelect.value = cat;
          categorySelect.dispatchEvent(new Event('change'));

          reportSection?.scrollIntoView({ behavior: 'smooth' });

          // Visual highlight pulse on category select
          categorySelect.classList.add('border-danger');
          setTimeout(() => {
            categorySelect.classList.remove('border-danger');
          }, 1600);

          showToast('Category Selected', `Reporting form prepared for: ${cat}`, 'info');
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 10. REPORT TRACKING & 6-STAGE TIMELINE
  // --------------------------------------------------------------------------
  function initTracking() {
    const form = document.getElementById('trackSearchForm');
    const input = document.getElementById('trackIncidentId');
    const chips = document.querySelectorAll('.chip-btn');

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = input?.value.trim();
      if (id) {
        performTrackSearch(id);
      }
    });

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const id = chip.getAttribute('data-track-id');
        if (input && id) {
          input.value = id;
          performTrackSearch(id);
        }
      });
    });

    // Default search on load with first demo incident
    if (appState.incidents.length > 0) {
      performTrackSearch(appState.incidents[0].id);
    }
  }

  function performTrackSearch(incidentId) {
    const resultBox = document.getElementById('trackingResultBox');
    if (!resultBox) return;

    const query = incidentId.trim().toUpperCase();
    const incident = appState.incidents.find(i => i.id.toUpperCase() === query);

    if (!incident) {
      resultBox.innerHTML = `
        <div class="alert alert-warning border text-center p-4">
          <i class="fa-solid fa-triangle-exclamation fs-3 text-warning mb-2 d-block"></i>
          <h5 class="fw-bold">No Report Found</h5>
          <p class="mb-2 text-muted">No incident matching ID <strong>${escapeHtml(incidentId)}</strong> was found in local storage.</p>
          <small class="text-muted">Please double-check your Incident ID or try one of the demo shortcuts above.</small>
        </div>
      `;
      return;
    }

    const currentStageIndex = STATUS_STAGES.indexOf(incident.status);
    const progressPercent = currentStageIndex >= 0 ? (currentStageIndex / (STATUS_STAGES.length - 1)) * 100 : 0;

    let priorityBadgeClass = 'p-medium';
    if (incident.priority === 'Critical') priorityBadgeClass = 'p-critical';
    else if (incident.priority === 'High') priorityBadgeClass = 'p-high';
    else if (incident.priority === 'Low') priorityBadgeClass = 'p-low';

    resultBox.innerHTML = `
      <!-- Incident Header Banner -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 mb-3 border-bottom">
        <div>
          <span class="badge bg-secondary mb-1">INCIDENT TRACKING DOSSIER</span>
          <h4 class="fw-bold mb-0 text-primary">${escapeHtml(incident.id)}: ${escapeHtml(incident.title)}</h4>
        </div>
        <div class="d-flex gap-2 align-items-center">
          <span class="priority-badge-live ${priorityBadgeClass}">
            <i class="fa-solid fa-shield me-1"></i> ${escapeHtml(incident.priority)} Priority
          </span>
          <span class="status-pill s-${getStatusCssSlug(incident.status)}">${escapeHtml(incident.status)}</span>
        </div>
      </div>

      <!-- 6-Stage Timeline -->
      <div class="timeline-container">
        <div class="timeline-progress-bar" style="width: ${progressPercent}%;"></div>
        <div class="timeline-steps">
          ${STATUS_STAGES.map((stage, idx) => {
            let stepClass = '';
            if (idx < currentStageIndex) stepClass = 'completed';
            else if (idx === currentStageIndex) stepClass = 'active';

            return `
              <div class="timeline-step ${stepClass}">
                <div class="step-node">
                  ${idx < currentStageIndex ? '<i class="fa-solid fa-check"></i>' : (idx + 1)}
                </div>
                <div class="step-label">${stage}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Incident Meta Card -->
      <div class="row g-3 mt-3">
        <div class="col-md-7">
          <div class="p-3 bg-surface border rounded">
            <h6 class="fw-bold text-primary mb-2"><i class="fa-solid fa-circle-info me-2"></i>Incident Information</h6>
            <div class="row g-2 small">
              <div class="col-sm-6 text-muted">Category: <strong class="text-body d-block">${escapeHtml(incident.category)}</strong></div>
              <div class="col-sm-6 text-muted">Submitted At: <strong class="text-body d-block">${escapeHtml(incident.timestamp)}</strong></div>
              <div class="col-sm-6 text-muted">Location: <strong class="text-body d-block">${escapeHtml(incident.location)}</strong></div>
              <div class="col-sm-6 text-muted">People Affected: <strong class="text-body d-block">${incident.affected} persons</strong></div>
              <div class="col-sm-6 text-muted">Immediate Threat: <strong class="${incident.danger === 'Yes' ? 'text-danger fw-bold' : 'text-body'} d-block">${incident.danger}</strong></div>
              <div class="col-sm-6 text-muted">Reported By: <strong class="text-body d-block">${escapeHtml(incident.reporterName || 'Anonymous')}</strong></div>
            </div>
            <hr class="my-2">
            <div class="small text-secondary">
              <strong>Description:</strong> ${escapeHtml(incident.description)}
            </div>
          </div>
        </div>

        <div class="col-md-5">
          <div class="p-3 bg-surface border rounded h-100 d-flex flex-direction-column justify-content-between">
            <div>
              <h6 class="fw-bold text-primary mb-2"><i class="fa-solid fa-clock-rotate-left me-2"></i>Dispatcher Log &amp; Actions</h6>
              <div class="p-2 bg-surface-secondary rounded small mb-3 border">
                <strong class="text-dark d-block mb-1">Latest Dispatcher Note:</strong>
                <p class="mb-0 text-muted">${escapeHtml(incident.notes || 'Awaiting officer field assessment.')}</p>
              </div>
              ${incident.image ? `
                <div class="mb-2">
                  <small class="text-muted d-block mb-1">Attached Incident Scene:</small>
                  <img src="${incident.image}" alt="Scene Preview" class="rounded border" style="max-height: 120px; object-fit: cover; width: 100%;">
                </div>
              ` : ''}
            </div>

            <div class="mt-2">
              <button type="button" class="btn btn-sm btn-outline-primary w-100" id="btnTrackViewOnMap">
                <i class="fa-solid fa-map-location-dot me-1"></i> Locate Incident on Live Map
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind Locate on Map Button
    const mapBtn = document.getElementById('btnTrackViewOnMap');
    if (mapBtn) {
      mapBtn.addEventListener('click', () => {
        const mapSection = document.getElementById('map-section');
        mapSection?.scrollIntoView({ behavior: 'smooth' });

        if (appState.map && !isNaN(incident.lat) && !isNaN(incident.lng)) {
          appState.map.setView([incident.lat, incident.lng], 16);
          // Highlight active incident marker
          const targetMarker = appState.mapMarkers.find(m => m.incidentId === incident.id);
          if (targetMarker) {
            targetMarker.marker.openPopup();
          }
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // 11. INTERACTIVE MAP ENGINE (LEAFLET.JS + OPENSTREETMAP)
  // --------------------------------------------------------------------------
  function initLeafletMap() {
    const mapEl = document.getElementById('emergencyMap');
    if (!mapEl || typeof L === 'undefined') return;

    // Initialize Map
    appState.map = L.map('emergencyMap', {
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
      zoomControl: true,
      attributionControl: true
    });

    // Add OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(appState.map);

    // Setup Layer Filter Buttons
    const filterBtns = document.querySelectorAll('.btn-map-filter');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        appState.activeMapFilter = btn.getAttribute('data-map-layer');
        renderMapMarkers();
      });
    });

    // Map Center User Button
    const btnCenter = document.getElementById('btnMapCenterUser');
    btnCenter?.addEventListener('click', () => {
      if (!navigator.geolocation) {
        showToast('Geolocation Unsupported', 'Geolocation is not supported by your browser.', 'warning');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          appState.map.setView([lat, lng], 15);
          addOrUpdateUserLocationMarker(lat, lng);
          showToast('Map Centered', 'Map centered at your current GPS coordinates.', 'info');
        },
        () => {
          showToast('GPS Error', 'Could not locate current position.', 'warning');
        }
      );
    });

    // Reset View Button
    const btnReset = document.getElementById('btnMapReset');
    btnReset?.addEventListener('click', () => {
      appState.map.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
    });

    // External service cards with "View Map" filter triggers
    const extFilterBtns = document.querySelectorAll('[data-filter-map]');
    extFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-filter-map');
        const targetBtn = document.querySelector(`.btn-map-filter[data-map-layer="${type}"]`);
        if (targetBtn) {
          targetBtn.click();
        }
        document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Initial render of markers
    renderMapMarkers();
  }

  function addOrUpdateUserLocationMarker(lat, lng) {
    if (!appState.map) return;
    if (appState.userLocationMarker) {
      appState.map.removeLayer(appState.userLocationMarker);
    }

    const userIcon = L.divIcon({
      className: 'custom-pin user-pin',
      html: '<i class="fa-solid fa-circle-dot text-primary" style="font-size: 22px; filter: drop-shadow(0 0 6px #2563eb);"></i>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    appState.userLocationMarker = L.marker([lat, lng], { icon: userIcon })
      .addTo(appState.map)
      .bindPopup('<strong><i class="fa-solid fa-location-crosshairs text-primary me-1"></i> Your Detected Position</strong><br><small>GPS coordinates locked.</small>')
      .openPopup();
  }

  function renderMapMarkers() {
    if (!appState.map) return;

    // Clear existing markers
    appState.mapMarkers.forEach(m => appState.map.removeLayer(m.marker));
    appState.mapMarkers = [];

    const currentFilter = appState.activeMapFilter;

    // 1. Render Official Emergency Stations
    EMERGENCY_STATIONS.forEach(st => {
      if (currentFilter !== 'all' && currentFilter !== st.type) {
        return;
      }

      let iconHtml = '<i class="fa-solid fa-hospital"></i>';
      let pinClass = 'hospital-pin';
      if (st.type === 'police') {
        iconHtml = '<i class="fa-solid fa-shield"></i>';
        pinClass = 'police-pin';
      } else if (st.type === 'fire') {
        iconHtml = '<i class="fa-solid fa-fire"></i>';
        pinClass = 'fire-pin';
      }

      const icon = L.divIcon({
        className: `custom-pin ${pinClass}`,
        html: `<div style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:50%;">${iconHtml}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const popupHtml = `
        <div style="min-width: 200px;">
          <h6 class="fw-bold mb-1 text-primary">${escapeHtml(st.name)}</h6>
          <div class="small text-muted mb-1">${escapeHtml(st.address)}</div>
          <div class="badge bg-success mb-2">${escapeHtml(st.status)}</div>
          <div class="d-flex gap-2 mt-1">
            <a href="tel:${st.phone}" class="btn btn-sm btn-danger py-1 px-2 w-100"><i class="fa-solid fa-phone me-1"></i> Call ${st.phone}</a>
          </div>
        </div>
      `;

      const marker = L.marker([st.lat, st.lng], { icon: icon }).addTo(appState.map).bindPopup(popupHtml);
      appState.mapMarkers.push({ marker: marker, type: st.type });
    });

    // 2. Render Active Incidents
    if (currentFilter === 'all' || currentFilter === 'incident') {
      appState.incidents.forEach(inc => {
        if (isNaN(inc.lat) || isNaN(inc.lng)) return;

        const isResolved = inc.status === 'Resolved';
        const pinClass = isResolved ? 'custom-pin hospital-pin' : 'custom-pin incident-pin';
        const iconHtml = isResolved ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-exclamation"></i>';

        const icon = L.divIcon({
          className: pinClass,
          html: `<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;">${iconHtml}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const popupHtml = `
          <div style="min-width: 220px;">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="badge bg-danger">${escapeHtml(inc.id)}</span>
              <span class="small text-muted">${escapeHtml(inc.status)}</span>
            </div>
            <h6 class="fw-bold mb-1 text-dark">${escapeHtml(inc.title)}</h6>
            <div class="small text-secondary mb-2">${escapeHtml(inc.location)}</div>
            <div class="small text-muted mb-2">Priority: <strong>${escapeHtml(inc.priority)}</strong></div>
            <button class="btn btn-sm btn-primary w-100 py-1" onclick="window.serQuickTrack('${inc.id}')">
              <i class="fa-solid fa-magnifying-glass me-1"></i> Inspect Report
            </button>
          </div>
        `;

        const marker = L.marker([inc.lat, inc.lng], { icon: icon }).addTo(appState.map).bindPopup(popupHtml);
        appState.mapMarkers.push({ marker: marker, type: 'incident', incidentId: inc.id });
      });
    }
  }

  // Window helper for popup onclick
  window.serQuickTrack = function (id) {
    const trackSection = document.getElementById('track-section');
    trackSection?.scrollIntoView({ behavior: 'smooth' });
    const trackInput = document.getElementById('trackIncidentId');
    if (trackInput) {
      trackInput.value = id;
      performTrackSearch(id);
    }
  };

  // --------------------------------------------------------------------------
  // 12. DEMO RESPONSE CENTER (DISPATCHER CONSOLE)
  // --------------------------------------------------------------------------
  function initDispatchCenter() {
    const searchInput = document.getElementById('dispatchSearchInput');
    const filterCat = document.getElementById('dispatchFilterCategory');
    const filterPri = document.getElementById('dispatchFilterPriority');
    const btnReset = document.getElementById('btnResetDemoData');

    searchInput?.addEventListener('input', renderDispatchTable);
    filterCat?.addEventListener('change', renderDispatchTable);
    filterPri?.addEventListener('change', renderDispatchTable);

    btnReset?.addEventListener('click', () => {
      if (confirm('Reset incident database back to initial realistic demo records? This will clear locally submitted incidents.')) {
        appState.incidents = [...INITIAL_DEMO_INCIDENTS];
        saveIncidents();
        renderAllViews();
        showToast('Data Reset', 'Incident records restored to initial demo set.', 'info');
      }
    });
  }

  function renderDispatchTable() {
    const tbody = document.getElementById('dispatchTableBody');
    const countBadge = document.getElementById('dispatchCountBadge');
    if (!tbody) return;

    const query = document.getElementById('dispatchSearchInput')?.value.toLowerCase().trim() || '';
    const cat = document.getElementById('dispatchFilterCategory')?.value || 'ALL';
    const pri = document.getElementById('dispatchFilterPriority')?.value || 'ALL';

    const filtered = appState.incidents.filter(inc => {
      const matchQuery = !query ||
        inc.id.toLowerCase().includes(query) ||
        inc.title.toLowerCase().includes(query) ||
        inc.location.toLowerCase().includes(query);

      const matchCat = (cat === 'ALL') || (inc.category === cat);
      const matchPri = (pri === 'ALL') || (inc.priority === pri);

      return matchQuery && matchCat && matchPri;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} Incidents`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-muted">
            <i class="fa-solid fa-folder-open fs-4 d-block mb-2 text-secondary"></i>
            No incident reports match the current filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(inc => {
      let priorityClass = 'p-medium';
      if (inc.priority === 'Critical') priorityClass = 'p-critical';
      else if (inc.priority === 'High') priorityClass = 'p-high';
      else if (inc.priority === 'Low') priorityClass = 'p-low';

      return `
        <tr>
          <td class="fw-bold text-primary">${escapeHtml(inc.id)}</td>
          <td>
            <div class="fw-bold text-dark">${escapeHtml(inc.title)}</div>
            <small class="text-muted">${escapeHtml(inc.category)} &bull; ${escapeHtml(inc.timestamp)}</small>
          </td>
          <td>
            <span class="priority-badge-live ${priorityClass}" style="font-size:0.75rem; padding: 3px 8px;">
              ${escapeHtml(inc.priority)}
            </span>
          </td>
          <td><small class="text-secondary">${escapeHtml(inc.location)}</small></td>
          <td>
            <select class="form-select form-select-sm status-select" data-incident-id="${inc.id}">
              ${STATUS_STAGES.map(st => `
                <option value="${st}" ${inc.status === st ? 'selected' : ''}>${st}</option>
              `).join('')}
            </select>
          </td>
          <td>
            <button type="button" class="btn btn-sm btn-outline-secondary py-1 px-2 btn-view-incident" data-incident-id="${inc.id}" title="View Details">
              <i class="fa-solid fa-eye"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Bind Status Change Dropdowns
    tbody.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = select.getAttribute('data-incident-id');
        const newStatus = e.target.value;
        updateIncidentStatus(id, newStatus);
      });
    });

    // Bind View Details Buttons
    tbody.querySelectorAll('.btn-view-incident').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-incident-id');
        openIncidentDetailsModal(id);
      });
    });
  }

  function updateIncidentStatus(id, newStatus) {
    const inc = appState.incidents.find(i => i.id === id);
    if (!inc) return;

    inc.status = newStatus;
    saveIncidents();

    // Re-render views
    renderAllViews();

    // If active in tracking view, update timeline immediately
    const trackInput = document.getElementById('trackIncidentId');
    if (trackInput && trackInput.value.toUpperCase() === id.toUpperCase()) {
      performTrackSearch(id);
    }

    showToast('Dispatch Status Updated', `${id} moved to: ${newStatus}`, 'success');
  }

  function openIncidentDetailsModal(incidentId) {
    const inc = appState.incidents.find(i => i.id === incidentId);
    if (!inc) return;

    const modalBody = document.getElementById('incidentDetailsModalBody');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 class="fw-bold mb-0 text-primary">${escapeHtml(inc.id)}: ${escapeHtml(inc.title)}</h4>
        <span class="status-pill s-${getStatusCssSlug(inc.status)}">${escapeHtml(inc.status)}</span>
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <div class="p-3 bg-surface-secondary rounded border small">
            <div><strong>Category:</strong> ${escapeHtml(inc.category)}</div>
            <div><strong>Severity:</strong> ${escapeHtml(inc.severity)}</div>
            <div><strong>Calculated Priority:</strong> ${escapeHtml(inc.priority)}</div>
            <div><strong>Immediate Danger:</strong> ${escapeHtml(inc.danger)}</div>
            <div><strong>People Affected:</strong> ${inc.affected}</div>
            <div><strong>Location:</strong> ${escapeHtml(inc.location)}</div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="p-3 bg-surface-secondary rounded border small">
            <div><strong>Reporter:</strong> ${escapeHtml(inc.reporterName || 'Anonymous')}</div>
            <div><strong>Contact:</strong> ${escapeHtml(inc.contact || 'None provided')}</div>
            <div><strong>Reported Time:</strong> ${escapeHtml(inc.timestamp)}</div>
            <div><strong>GPS Lat/Lng:</strong> ${inc.lat?.toFixed(4)}, ${inc.lng?.toFixed(4)}</div>
            <div><strong>Priority Engine Reason:</strong> ${escapeHtml(inc.priorityReason)}</div>
          </div>
        </div>
        <div class="col-12">
          <div class="p-3 bg-surface border rounded">
            <strong>Full Incident Description:</strong>
            <p class="mb-0 mt-1 text-secondary small">${escapeHtml(inc.description)}</p>
          </div>
        </div>
        ${inc.image ? `
          <div class="col-12 text-center">
            <img src="${inc.image}" alt="Incident Attachment" class="img-fluid rounded border shadow-sm" style="max-height: 280px; object-fit: contain;">
          </div>
        ` : ''}
      </div>
    `;

    const modalEl = document.getElementById('incidentDetailsModal');
    if (modalEl) {
      const bsModal = new bootstrap.Modal(modalEl);
      bsModal.show();
    }
  }

  // --------------------------------------------------------------------------
  // 13. EMERGENCY STATISTICS & CHART.JS ENGINE
  // --------------------------------------------------------------------------
  function initCharts() {
    if (typeof Chart === 'undefined') return;

    // Set Global Chart Defaults
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = appState.currentTheme === 'dark' ? '#cbd5e1' : '#475569';

    // 1. Category Donut Chart
    const ctxCat = document.getElementById('categoryChart')?.getContext('2d');
    if (ctxCat) {
      appState.charts.category = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: [
              '#dc2626', '#2563eb', '#f59e0b', '#16a34a',
              '#7e22ce', '#0891b2', '#ea580c', '#64748b'
            ],
            borderWidth: 2,
            borderColor: appState.currentTheme === 'dark' ? '#111827' : '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, padding: 12 }
            }
          }
        }
      });
    }

    // 2. Status Bar Chart
    const ctxStatus = document.getElementById('statusChart')?.getContext('2d');
    if (ctxStatus) {
      appState.charts.status = new Chart(ctxStatus, {
        type: 'bar',
        data: {
          labels: STATUS_STAGES,
          datasets: [{
            label: 'Incidents in Stage',
            data: [],
            backgroundColor: [
              '#38bdf8', '#fbbf24', '#a78bfa',
              '#fb923c', '#f87171', '#4ade80'
            ],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

    // 3. Monthly Trend Chart
    const ctxTrend = document.getElementById('trendChart')?.getContext('2d');
    if (ctxTrend) {
      appState.charts.trend = new Chart(ctxTrend, {
        type: 'line',
        data: {
          labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep (Live)'],
          datasets: [{
            label: 'Total Reports',
            data: [18, 24, 21, 35, 42, appState.incidents.length + 38],
            fill: true,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            tension: 0.35,
            pointBackgroundColor: '#2563eb'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  }

  function updateCharts() {
    if (!appState.charts.category || !appState.charts.status) return;

    // Calculate Category Breakdown
    const catCounts = {};
    appState.incidents.forEach(i => {
      catCounts[i.category] = (catCounts[i.category] || 0) + 1;
    });

    appState.charts.category.data.labels = Object.keys(catCounts);
    appState.charts.category.data.datasets[0].data = Object.values(catCounts);
    appState.charts.category.update();

    // Calculate Status Breakdown
    const statusCounts = STATUS_STAGES.map(stage => {
      return appState.incidents.filter(i => i.status === stage).length;
    });

    appState.charts.status.data.datasets[0].data = statusCounts;
    appState.charts.status.update();

    // Update Trend Chart latest point
    if (appState.charts.trend) {
      const dataArr = appState.charts.trend.data.datasets[0].data;
      dataArr[dataArr.length - 1] = 38 + appState.incidents.length;
      appState.charts.trend.update();
    }
  }

  function updateChartsTheme() {
    const textColor = appState.currentTheme === 'dark' ? '#cbd5e1' : '#475569';
    const borderColor = appState.currentTheme === 'dark' ? '#111827' : '#ffffff';

    Object.values(appState.charts).forEach(chart => {
      if (!chart) return;
      Chart.defaults.color = textColor;
      if (chart.options.scales?.y) {
        chart.options.scales.y.ticks.color = textColor;
        chart.options.scales.x.ticks.color = textColor;
      }
      if (chart.data.datasets[0]?.borderColor && chart.config.type === 'doughnut') {
        chart.data.datasets[0].borderColor = borderColor;
      }
      chart.update();
    });
  }

  // --------------------------------------------------------------------------
  // 14. STAT COUNTERS & ALL VIEW SYNCHRONIZATION
  // --------------------------------------------------------------------------
  function renderAllViews() {
    // 1. Stat Counters
    const total = appState.incidents.length;
    const active = appState.incidents.filter(i => i.status !== 'Resolved').length;
    const resolved = appState.incidents.filter(i => i.status === 'Resolved').length;

    animateCounter('statTotalReports', total);
    animateCounter('statActiveEmergencies', active);
    animateCounter('statResolvedReports', resolved);

    // Hero stats
    const heroActive = document.getElementById('heroStatActive');
    if (heroActive) heroActive.textContent = active;

    // 2. Refresh Tables, Charts & Map Markers
    renderDispatchTable();
    updateCharts();
    renderMapMarkers();
  }

  function animateCounter(elemId, targetVal) {
    const el = document.getElementById(elemId);
    if (!el) return;
    const startVal = parseInt(el.textContent, 10) || 0;
    if (startVal === targetVal) return;

    let start = null;
    const duration = 500;

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const current = Math.floor(progress * (targetVal - startVal) + startVal);
      el.textContent = current;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = targetVal;
      }
    }
    window.requestAnimationFrame(step);
  }

  // --------------------------------------------------------------------------
  // 15. SAFETY SEARCH FILTER
  // --------------------------------------------------------------------------
  function initSafetySearch() {
    const input = document.getElementById('safetySearchInput');
    const items = document.querySelectorAll('.safety-accordion .accordion-item');

    input?.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      items.forEach(item => {
        const topic = item.getAttribute('data-safety-topic') || '';
        const text = item.textContent.toLowerCase();
        if (!q || topic.includes(q) || text.includes(q)) {
          item.classList.remove('d-none');
        } else {
          item.classList.add('d-none');
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 16. CONTACT FORM & MAILTO GENERATOR
  // --------------------------------------------------------------------------
  function initContactForm() {
    const form = document.getElementById('generalContactForm');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        showToast('Validation Error', 'Please complete all required fields.', 'danger');
        return;
      }

      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const subject = document.getElementById('contactSubject').value.trim();
      const message = document.getElementById('contactMessage').value.trim();

      // Show success modal or toast
      showToast('Message Prepared Successfully', `Thank you ${name}. Your message has been formatted for civic submission.`, 'success');

      form.reset();
      form.classList.remove('was-validated');
    });
  }

  // --------------------------------------------------------------------------
  // 17. TOAST NOTIFICATION ENGINE
  // --------------------------------------------------------------------------
  function showToast(title, message, type = 'info', duration = 4200) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    let icon = 'fa-circle-info';
    let typeClass = 'toast-info';
    if (type === 'success') {
      icon = 'fa-circle-check';
      typeClass = 'toast-success';
    } else if (type === 'danger') {
      icon = 'fa-circle-exclamation';
      typeClass = 'toast-danger';
    } else if (type === 'warning') {
      icon = 'fa-triangle-exclamation';
      typeClass = 'toast-warning';
    }

    const toast = document.createElement('div');
    toast.className = `ser-toast ${typeClass}`;
    toast.innerHTML = `
      <div class="ser-toast-icon"><i class="fa-solid ${icon}"></i></div>
      <div class="ser-toast-content">
        <div class="ser-toast-title">${escapeHtml(title)}</div>
        <div class="ser-toast-message">${escapeHtml(message)}</div>
      </div>
      <button type="button" class="ser-toast-close" aria-label="Dismiss toast">&times;</button>
    `;

    container.appendChild(toast);

    // Trigger slide-in
    setTimeout(() => toast.classList.add('show'), 20);

    const closeBtn = toast.querySelector('.ser-toast-close');
    const dismiss = () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 360);
    };

    closeBtn?.addEventListener('click', dismiss);
    setTimeout(dismiss, duration);
  }

  // --------------------------------------------------------------------------
  // 18. HELPERS & UTILITIES
  // --------------------------------------------------------------------------
  function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getStatusCssSlug(status) {
    switch (status) {
      case 'Reported': return 'reported';
      case 'Under Review': return 'review';
      case 'Verified': return 'verified';
      case 'Assigned': return 'assigned';
      case 'Response In Progress': return 'progress';
      case 'Resolved': return 'resolved';
      default: return 'reported';
    }
  }

})();
