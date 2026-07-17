export const PORTFOLIO_DATA = {
  "personal": {
    "name": "Mohammad Shariq Saifi",
    "title": "Python Automation Tester | SDET | API & Web Automation",
    "location": "Gurugram, Haryana, India",
    "phone": "+91 7309146115",
    "email": "shariksaifi356@gmail.com",
    "github": "https://github.com/shariqsaifi",
    "linkedin": "https://linkedin.com/in/shariqsaifi",
    "summary": "Python Automation Tester with close to 4 years of experience building and maintaining automation frameworks for enterprise banking and financial services applications. Hands-on expertise in Selenium WebDriver and Playwright with Python for web UI automation, and Postman, Swagger/OpenAPI, and Python Requests for REST API testing and backend validation. Experienced with Git version control, Jenkins, and CI/CD pipeline integration for automated test execution. Strong domain knowledge in Corporate Actions, SWIFT Payments, and ISO15022 (MT) / ISO20022 (MX) financial messaging standards."
  },
  "skills": {
    "Languages": ["Python", "Java", "Linux"],
    "Automation": ["Selenium WebDriver", "Playwright", "Page Object Model (POM)"],
    "API": ["Postman", "Swagger / OpenAPI", "Python Requests", "REST API Testing", "Backend Validation"],
    "Frameworks": ["Pytest", "Data-Driven Framework", "Keyword-Driven Framework", "BDD / Behave"],
    "CI_CD": ["Jenkins", "Git", "GitHub Actions", "CI/CD Pipeline Integration"],
    "Databases": ["SQL", "Oracle SQL Developer"],
    "Test Management": ["JIRA", "Defect Tracking", "Test Case Design", "Requirement Analysis"],
    "Testing Types": ["Regression Testing", "Smoke Testing", "Sanity Testing", "Functional Testing", "UAT Support", "Data Validation"],
    "Reports": ["pytest-html", "Allure", "Extent Reports", "ReportPortal", "JUnit/XML Reports", "BDD/Cucumber Reports"],
    "Banking Domain": ["Corporate Actions", "SWIFT Payments", "ISO15022 (MT)", "ISO20022 (MX)"]
  },
  "experience": [
    {
      "company": "Tata Consultancy Services Ltd",
      "role": "System Engineer",
      "duration": "Oct 2022 – Present",
      "responsibilities": [
        "Developed and maintained scalable automated test scripts using Selenium WebDriver, Python, and Pytest for regression, smoke, sanity, and functional testing across enterprise banking applications.",
        "Automated 400+ regression test cases for critical Corporate Actions workflows, improving automation coverage and test execution efficiency.",
        "Reduced manual testing effort by approximately 40% through automation of repetitive, business-critical scenarios and regression suites.",
        "Validated SWIFT Payments and ISO15022/ISO20022 financial messaging workflows for enterprise banking systems.",
        "Designed and executed API testing scenarios using Postman and Python Requests to validate backend services, response accuracy, payload structure, and data integrity.",
        "Performed backend database validation using SQL queries and Oracle SQL Developer to ensure accurate financial transaction processing.",
        "Implemented scalable automation frameworks using Page Object Model (POM), Data-Driven, and Keyword-Driven approaches to improve regression execution efficiency."
      ],
      "techStack": ["Python", "Selenium", "Pytest", "Postman", "SQL", "Jenkins"],
      "javaClass": "public class SystemEngineer extends Role {\n    String company = \"Tata Consultancy Services Ltd\";\n    String duration = \"Oct 2022 – Present\";\n    List<String> responsibilities = List.of(\n        \"Automated 400+ regression test cases for Corporate Actions\",\n        \"Reduced manual testing effort by approximately 40%\",\n        \"Validated SWIFT Payments and ISO15022/ISO20022 messages\",\n        \"Tested API endpoints using Postman & Python Requests\"\n    );\n}"
    },
    {
      "company": "Intesa Sanpaolo Bank (TCS Client)",
      "role": "Automation Test Engineer",
      "duration": "Oct 2023 – Present",
      "responsibilities": [
        "Designed, developed, and maintained automated test scripts using Selenium WebDriver, Python, and Pytest for business-critical financial workflows.",
        "Executed sanity, smoke, functional, regression, and end-to-end testing for enterprise banking applications.",
        "Automated high-priority regression scenarios to improve test coverage, reduce repetitive manual effort, and accelerate release validation cycles.",
        "Validated ISO15022 and ISO20022 financial message processing workflows and ensured accurate transaction processing across banking applications.",
        "Performed API testing and backend data validation using SQL queries to validate business workflows and data integrity.",
        "Participated in defect triaging, root cause analysis, issue validation, and coordination with development and business teams.",
        "Prepared Solution Design Documents (SDD), test cases, test scenarios, requirement analysis documents, and test execution reports."
      ],
      "techStack": ["Python", "Selenium WebDriver", "Pytest", "ISO20022", "SQL", "JIRA"],
      "javaClass": "public class AutomationTestEngineer extends Role {\n    String client = \"Intesa Sanpaolo Bank\";\n    String duration = \"Oct 2023 – Present\";\n    List<String> responsibilities = List.of(\n        \"Designed automated scripts using Selenium WebDriver & Pytest\",\n        \"Validated ISO15022 & ISO20022 financial messages\",\n        \"Performed API testing and SQL backend data validations\",\n        \"Prepared Solution Design Documents (SDD) & test reports\"\n    );\n}"
    },
    {
      "company": "JP Morgan Chase Bank (TCS Client)",
      "role": "Automation QA Analyst",
      "duration": "Mar 2023 – Oct 2023",
      "responsibilities": [
        "Worked on Corporate Actions and banking workflow validation.",
        "Performed UAT support and execution validation for client banking modules.",
        "Conducted detailed production defect analysis to identify root causes in data handling.",
        "Executed SQL validations checking transactional ledger consistency in Oracle DB."
      ],
      "techStack": ["Corporate Actions", "UAT Support", "SQL", "Oracle DB", "JIRA"],
      "javaClass": "public class JPMCAnalyst extends Role {\n    String client = \"JP Morgan Chase Bank\";\n    String duration = \"Mar 2023 – Oct 2023\";\n    List<String> responsibilities = List.of(\n        \"Worked on Corporate Actions and banking workflow validation\",\n        \"Provided client UAT support and release verification\",\n        \"Conducted database checking and SQL ledger consistency validations\"\n    );\n}"
    }
  ],
  "projects": [
    {
      "name": "Corporate Actions Automation Suite",
      "description": "Enterprise-grade UI regression testing framework built for automated validation of Corporate Actions workflows (dividends, mergers, stock splits). Reduces release validation cycles by 40%.",
      "techStack": ["Python", "Selenium WebDriver", "Pytest", "Allure Report", "Git"],
      "github": "https://github.com/shariqsaifi/corporate-actions-automation",
      "demo": "https://github.com/shariqsaifi/corporate-actions-automation",
      "features": [
        "Automated 400+ critical action workflows.",
        "Data-driven test sheets dynamically feeding mock transaction variables.",
        "Allure reports capturing error logs and transaction receipts."
      ],
      "challenges": "Extremely complex checkout dynamic grids caused element locating flakes. Solved by implementing dynamic polling strategies and custom expected conditions helpers in Python.",
      "lessons": "Separating test data sheets from functional scripts cuts test maintenance costs in half."
    },
    {
      "name": "SWIFT & ISO20022 Message Validator",
      "description": "API automation and contract testing suite built to validate SWIFT (MT) and ISO20022 (MX XML) financial messaging files. Validates schema structures and backend values.",
      "techStack": ["Python", "Requests", "Postman", "SQL", "Oracle Developer"],
      "github": "https://github.com/shariqsaifi/swift-message-validator",
      "demo": "https://github.com/shariqsaifi/swift-message-validator",
      "features": [
        "Automated API testing validating XML structures of ISO20022 messages.",
        "Asserted ledger table entries in Oracle Database via SQL queries.",
        "Scheduled pipeline sweeps checking authentication tokens and payload consistency."
      ],
      "challenges": "Database synchronization delays caused race conditions in post-transaction assertions. Resolved by implementing smart wait loops with exponential retries.",
      "lessons": "XML schema validations are highly error-prone if schemas aren't cached locally."
    }
  ],
  "education": {
    "degree": "Bachelor of Computer Applications (BCA)",
    "institution": "Babu Banarasi Das University (BBDU), Lucknow, Uttar Pradesh",
    "duration": "Aug 2019 – Jul 2022",
    "grade": "Grade: 85.06%"
  },
  "certifications": [
    {
      "name": "GitHub Copilot",
      "issuer": "Microsoft",
      "date": "July 2026",
      "id": "MS-COPILOT-9981",
      "icon": "🤖"
    },
    {
      "name": "Complete Python Certification",
      "issuer": "Udemy",
      "date": "2023",
      "id": "UDEMY-PY-7786",
      "icon": "🐍"
    },
    {
      "name": "Selenium WebDriver with Python, Cucumber BDD & CI/CD",
      "issuer": "Udemy",
      "date": "2023",
      "id": "UDEMY-SEL-1029",
      "icon": "🧪"
    }
  ]
};
