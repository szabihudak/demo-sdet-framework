import { type Locator, type Page } from "@playwright/test";

import type { CreateEventInput } from "@app/api/schemas/CreateEventInputSchema";

export class AdminEventsPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly categoryInput: Locator;
  readonly venueInput: Locator;
  readonly cityInput: Locator;
  readonly eventDateInput: Locator;
  readonly priceInput: Locator;
  readonly totalSeatsInput: Locator;
  readonly imageUrlInput: Locator;
  readonly createEventButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByRole("textbox", { name: "Title*" });
    this.descriptionInput = page.getByRole("textbox", {
      name: "Describe the event…",
    });
    this.categoryInput = page.getByRole("combobox", { name: "Category*" });
    this.venueInput = page.getByRole("textbox", { name: "Venue*" });
    this.cityInput = page.getByRole("textbox", { name: "City*" });
    this.eventDateInput = page.getByRole("textbox", {
      name: "Event Date & Time*",
    });
    this.priceInput = page.getByRole("spinbutton", { name: "Price ($)*" });
    this.totalSeatsInput = page.getByRole("spinbutton", {
      name: "Total Seats*",
    });
    this.imageUrlInput = page.getByRole("textbox", {
      name: "Image URL (optional)",
    });
    this.createEventButton = page.getByRole("button", {
      name: "+ Add Event",
    });
  }

  async goto(): Promise<void> {
    await this.page.goto("/admin/events");
  }

  async fillEvent(event: CreateEventInput): Promise<void> {
    await this.titleInput.fill(event.title);
    if (event.description !== undefined) {
      await this.descriptionInput.fill(event.description);
    }
    await this.categoryInput.selectOption(event.category);
    await this.venueInput.fill(event.venue);
    await this.cityInput.fill(event.city);
    await this.eventDateInput.fill(event.eventDate.slice(0, 16));
    await this.priceInput.fill(String(event.price));
    await this.totalSeatsInput.fill(String(event.totalSeats));
    if (event.imageUrl !== undefined) {
      await this.imageUrlInput.fill(event.imageUrl);
    }
  }

  async submitEvent(): Promise<void> {
    await this.createEventButton.click();
  }
}
