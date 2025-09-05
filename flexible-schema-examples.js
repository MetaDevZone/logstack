/**
 * 🎯 Real Examples - Kuch Bhi Save Kar Sakte Hain!
 * LogStack mein complete flexibility hai
 */

const { saveApiLog, saveLog } = require("logstack-zee");

// ===== E-COMMERCE EXAMPLES =====

// Order creation log
await saveApiLog({
  method: "POST",
  path: "/api/orders",
  responseStatus: 201,
  requestBody: {
    customer_id: "cust_123",
    products: [
      { id: 1, name: "iPhone 15", price: 150000, quantity: 1 },
      { id: 2, name: "AirPods", price: 25000, quantity: 2 },
    ],
    shipping_address: {
      name: "Ahmed Ali",
      phone: "+92-300-1234567",
      address: "House 123, Street 5, DHA Phase 2",
      city: "Karachi",
      postal_code: "75500",
    },
    payment: {
      method: "card",
      card_last_four: "1234",
      transaction_id: "txn_789456",
    },
    discounts: {
      coupon_code: "SAVE20",
      discount_amount: 10000,
      loyalty_points_used: 500,
    },
  },
  responseBody: {
    order_id: "ord_456789",
    total_amount: 200000,
    estimated_delivery: "2025-09-06",
    tracking_number: "TRK123456789",
  },
  metadata: {
    user_agent: "Mobile App v2.1.0",
    location: { lat: 24.8607, lng: 67.0011 },
    session_duration: 1800,
    previous_orders_count: 5,
    customer_tier: "gold",
    referral_source: "google_ads",
  },
});

// ===== BANKING/FINTECH EXAMPLES =====

// Money transfer log
await saveApiLog({
  method: "POST",
  path: "/api/transfers",
  responseStatus: 200,
  requestBody: {
    from_account: "acc_123456",
    to_account: "acc_789012",
    amount: 50000,
    currency: "PKR",
    purpose: "salary_payment",
    reference: "SAL_SEP_2025",
  },
  responseBody: {
    transaction_id: "txn_transfer_789",
    status: "completed",
    fee_charged: 25,
    exchange_rate: null,
    confirmation_code: "CONF123",
  },
  metadata: {
    risk_assessment: {
      score: 0.15,
      factors: ["amount_normal", "frequent_recipient", "verified_account"],
      aml_status: "passed",
      fraud_check: "clean",
    },
    compliance: {
      kyc_verified: true,
      sanctions_check: "clear",
      pep_check: "negative",
      source_of_funds: "salary",
    },
    device_info: {
      device_id: "dev_mobile_456",
      os: "Android 13",
      app_version: "3.2.1",
      biometric_auth: true,
      location_verified: true,
    },
  },
});

// ===== HEALTHCARE EXAMPLES =====

// Patient appointment log
await saveApiLog({
  method: "POST",
  path: "/api/appointments",
  responseStatus: 201,
  requestBody: {
    patient_id: "pat_123",
    doctor_id: "doc_456",
    appointment_type: "consultation",
    scheduled_date: "2025-09-10",
    scheduled_time: "14:30",
    symptoms: ["fever", "cough", "headache"],
    urgency: "normal",
  },
  responseBody: {
    appointment_id: "appt_789",
    confirmation_number: "CONF789123",
    estimated_wait_time: 15,
    preparation_instructions: ["bring_previous_reports", "fast_for_8_hours"],
  },
  metadata: {
    patient_history: {
      previous_visits: 3,
      last_visit: "2025-07-15",
      chronic_conditions: ["diabetes", "hypertension"],
      allergies: ["penicillin", "shellfish"],
      current_medications: ["metformin", "lisinopril"],
    },
    insurance: {
      provider: "Health Plus",
      policy_number: "HP123456",
      coverage_type: "premium",
      copay_amount: 500,
    },
    visit_context: {
      referred_by: "doc_123",
      follow_up_required: true,
      lab_tests_needed: ["blood_sugar", "bp_monitoring"],
      telemedicine_eligible: false,
    },
  },
});

// ===== EDUCATION EXAMPLES =====

// Student enrollment log
await saveLog("info", "Student enrolled in course", {
  service: "enrollment-service",
  metadata: {
    student: {
      id: "std_123",
      name: "Fatima Khan",
      email: "fatima@student.edu.pk",
      phone: "+92-321-9876543",
      cnic: "42401-1234567-8",
      date_of_birth: "2000-05-15",
      address: {
        city: "Lahore",
        area: "Gulberg",
        postal_code: "54000",
      },
    },
    course: {
      id: "course_456",
      name: "Computer Science Fundamentals",
      code: "CS101",
      credits: 3,
      semester: "Fall 2025",
      instructor: "Dr. Ahmed Hassan",
      schedule: {
        days: ["monday", "wednesday", "friday"],
        time: "09:00-10:30",
        room: "CS-Lab-1",
      },
    },
    enrollment: {
      date: "2025-09-04",
      type: "regular",
      fee_paid: 15000,
      payment_method: "bank_transfer",
      scholarship_applied: true,
      scholarship_amount: 3000,
      installments: {
        total: 3,
        paid: 1,
        next_due: "2025-10-01",
      },
    },
    academic_record: {
      previous_semester_gpa: 3.7,
      total_credits_completed: 45,
      major: "computer_science",
      expected_graduation: "2027-06-30",
      probation_status: false,
    },
  },
});

// ===== LOGISTICS/DELIVERY EXAMPLES =====

// Package tracking log
await saveApiLog({
  method: "PUT",
  path: "/api/shipments/track",
  responseStatus: 200,
  requestBody: {
    tracking_number: "TRK123456789",
    status_update: "in_transit",
    location: "Karachi Distribution Center",
    scan_time: "2025-09-04T14:30:00Z",
  },
  responseBody: {
    updated: true,
    current_status: "in_transit",
    estimated_delivery: "2025-09-06T18:00:00Z",
    next_checkpoint: "Lahore Hub",
  },
  metadata: {
    package: {
      id: "pkg_789123",
      weight: "2.5kg",
      dimensions: { length: 30, width: 20, height: 15 },
      value: 25000,
      fragile: true,
      priority: "express",
    },
    route: {
      origin: "Karachi Warehouse",
      destination: "Lahore Customer",
      total_distance: "1200km",
      checkpoints: [
        {
          name: "Karachi Hub",
          status: "completed",
          time: "2025-09-04T08:00:00Z",
        },
        {
          name: "Hyderabad Center",
          status: "completed",
          time: "2025-09-04T12:00:00Z",
        },
        { name: "Sukkur Hub", status: "in_progress", time: null },
        { name: "Lahore Hub", status: "pending", time: null },
      ],
    },
    delivery: {
      recipient: {
        name: "Ali Hassan",
        phone: "+92-300-7654321",
        address: "Office 45, Blue Area, Islamabad",
        delivery_instructions: "Call before delivery, office hours 9-5",
      },
      driver: {
        id: "driver_456",
        name: "Muhammad Saeed",
        phone: "+92-333-1122334",
        vehicle_number: "KHI-123",
      },
      weather_conditions: "clear",
      traffic_status: "moderate",
      alternative_routes: ["route_a", "route_b"],
    },
  },
});

// ===== IOT/SMART HOME EXAMPLES =====

// Smart device log
await saveLog("info", "Temperature sensor reading", {
  service: "iot-monitoring",
  metadata: {
    device: {
      id: "sensor_temp_001",
      type: "temperature_humidity",
      model: "DHT22",
      firmware_version: "v2.1.3",
      location: {
        room: "living_room",
        floor: 1,
        coordinates: { x: 5.2, y: 3.1 },
      },
      battery_level: 85,
      signal_strength: -45,
      last_maintenance: "2025-08-15",
    },
    reading: {
      temperature: 24.5,
      humidity: 65,
      timestamp: "2025-09-04T14:30:15Z",
      accuracy: "±0.1°C",
      calibration_status: "current",
    },
    automation: {
      triggered_rules: ["ac_auto_on", "humidity_alert"],
      actions_taken: [
        { action: "turn_on_ac", time: "14:30:20", success: true },
        { action: "send_notification", time: "14:30:25", success: true },
      ],
      energy_usage: {
        before: "2.1kW",
        after: "3.8kW",
        cost_impact: "PKR 15/hour",
      },
    },
    historical: {
      avg_temp_last_24h: 23.2,
      min_temp_today: 21.5,
      max_temp_today: 26.8,
      trend: "increasing",
      anomaly_detected: false,
    },
  },
});

// ===== SOCIAL MEDIA EXAMPLES =====

// Post creation log
await saveApiLog({
  method: "POST",
  path: "/api/posts",
  responseStatus: 201,
  requestBody: {
    content: "Beautiful sunset at Clifton Beach! 🌅 #Karachi #Sunset",
    media: [
      { type: "image", url: "img_001.jpg", size: "2.1MB" },
      { type: "image", url: "img_002.jpg", size: "1.8MB" },
    ],
    location: {
      name: "Clifton Beach",
      coordinates: { lat: 24.8138, lng: 67.0299 },
      city: "Karachi",
    },
    privacy: "public",
    tags: ["#Karachi", "#Sunset", "#Beach"],
  },
  responseBody: {
    post_id: "post_789456",
    published_at: "2025-09-04T18:45:00Z",
    reach_estimate: "500-1000",
    engagement_prediction: "high",
  },
  metadata: {
    user: {
      id: "user_123",
      username: "ahmed_photographer",
      followers_count: 15000,
      verified: true,
      account_type: "creator",
      posting_frequency: "daily",
    },
    content_analysis: {
      sentiment: "positive",
      language: "english",
      detected_objects: ["sunset", "water", "people"],
      safety_score: 0.95,
      copyright_check: "passed",
      content_category: "travel_lifestyle",
    },
    engagement_metrics: {
      expected_likes: "100-200",
      expected_comments: "10-25",
      expected_shares: "5-15",
      peak_hours: ["19:00-21:00"],
      target_audience: ["photography_enthusiasts", "karachi_locals"],
    },
    technical: {
      upload_duration: 45,
      compression_applied: true,
      cdn_endpoint: "asia-south1",
      cache_regions: ["pk", "in", "ae"],
    },
  },
});

console.log("✅ All examples show LogStack can save ANY kind of data!");
console.log("🎯 Key point: Put custom data in 'metadata' field");
console.log("🚀 No restrictions on object structure or nesting!");
