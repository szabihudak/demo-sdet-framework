import { type Locator, type Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly invalidEmailMessage: Locator;
  readonly passwordLengthMessage: Locator;
  readonly errorToast: Locator;
  readonly homeHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Sign in to EventHub" });
    this.emailInput = page.getByRole("textbox", { name: "Email" });
    this.passwordInput = page.getByRole("textbox", { name: "Password" });
    this.signInButton = page.getByRole("button", { name: "Sign In" });
    this.invalidEmailMessage = page.getByText("Enter a valid email", {
      exact: true,
    });
    this.passwordLengthMessage = page.getByText(
      "Password must be at least 6 characters",
      { exact: true },
    );
    this.errorToast = page.getByText("Internal Server Error", { exact: true });
    this.homeHeading = page.getByRole("heading", {
      name: /Discover & Book\s+Amazing Events/,
    });
  }

  async goto(): Promise<void> {
    await this.page.goto("/login");
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.signInButton.click();
  }
}
