import { type Locator, type Page } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly userEmail: Locator;
  readonly logoutButton: Locator;
  readonly myBookingsNavigation: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", {
      name: /Discover & Book\s+Amazing Events/,
    });
    this.userEmail = page.getByTestId("user-email-display");
    this.logoutButton = page.getByTestId("logout-btn");
    this.myBookingsNavigation = page.getByTestId("nav-bookings");
  }
}
