import { Component } from '@angular/core';
@Component({
  selector: 'app-extended-toolkit',
  templateUrl: './extended-toolkit.html',
  styleUrl: './extended-toolkit.css',
})
export class ExtendedToolkit {
  readonly tools = [
    { name: 'TestNG', icon: 'java.svg', detail: 'Java test framework' },
    { name: 'unittest', icon: 'python.svg', detail: 'Python standard library' },
    { name: 'REST Assured', icon: 'restassured.png', detail: 'API automation' },
    { name: 'Newman', icon: 'postman.svg', detail: 'Postman command-line runner' },
    { name: 'Swagger / OpenAPI', icon: 'swagger.svg', detail: 'API specifications' },
    { name: 'Pact', icon: 'pact.png', detail: 'Contract testing' },
    { name: 'WireMock', icon: 'wiremock.svg', detail: 'Service virtualization' },
    { name: 'JMeter', icon: 'apachejmeter.svg', detail: 'Performance testing' },
    { name: 'Lighthouse', icon: 'lighthouse.svg', detail: 'Web quality audits' },
    { name: 'Allure', icon: 'allure.svg', detail: 'Test reporting' },
    { name: 'JUnit', icon: 'junit.svg', detail: 'Java test framework' },
    { name: 'JIRA', icon: 'jira.svg', detail: 'Test and defect management' },
    { name: 'flake8', icon: 'python.svg', detail: 'Python style and quality' },
    { name: 'pylint', icon: 'python.svg', detail: 'Python static analysis' },
    { name: 'mypy', icon: 'python.svg', detail: 'Python type checking' },
  ];
  readonly methods = [
    { name: 'Page Object Model', icon: 'pattern-pages.svg' },
    { name: 'Data-driven testing', icon: 'pattern-data.svg' },
    { name: 'Keyword-driven testing', icon: 'pattern-keyword.svg' },
    { name: 'BDD / Gherkin', icon: 'cucumber.svg' },
  ];
}
