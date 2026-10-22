import { type Locator, type Page } from "@playwright/test";

const categoryLabels: Record<string, string> = {
  Conference: "🎙 Conference",
  Concert: "🎵 Concert",
  Sports: "⚽ Sports",
  Workshop: "🛠 Workshop",
  Festival: "🎉 Festival",
};

export class EventsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly categoryFilter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: /events/i });
    this.categoryFilter = page.getByRole("combobox").filter({
      has: page.getByRole("option", { name: "All Categories" }),
    });
  }

  async goto(): Promise<void> {
    await this.page.goto("/events");
  }

  async filterByCategory(category: string): Promise<void> {
    const label = categoryLabels[category];
    if (!label) {
      throw new Error(`Unsupported event category: ${category}`);
    }
    await this.categoryFilter.selectOption({ label });
  }

  eventCardByTitle(title: string): Locator {
    return this.page.getByRole("article").filter({
      has: this.page.getByRole("heading", { name: title, exact: true }),
    });
  }

  eventTitle(title: string): Locator {
    return this.eventCardByTitle(title).getByRole("heading", {
      name: title,
      exact: true,
    });
  }

  eventImage(title: string): Locator {
    return this.eventCardByTitle(title).getByRole("img", { name: title });
  }

  bookNowButton(title: string): Locator {
    return this.eventCardByTitle(title).getByRole("link", { name: "Book Now" });
  }
}
