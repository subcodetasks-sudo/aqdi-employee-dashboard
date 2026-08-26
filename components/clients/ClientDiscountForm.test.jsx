import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClientDiscountForm from "./ClientDiscountForm";

async function fillRequiredFields(user) {
  await user.type(screen.getByLabelText("القيمة"), "10");
  await user.type(screen.getByLabelText("السبب"), "عميل مميز");
}

describe("ClientDiscountForm — notify-on-login checkbox", () => {
  it("renders إشعار العميل as an unchecked checkbox by default, with the message field disabled", () => {
    render(<ClientDiscountForm onSubmit={vi.fn()} isSubmitting={false} />);

    const checkbox = screen.getByRole("checkbox", { name: /إشعار العميل/ });
    expect(checkbox).not.toBeChecked();
    expect(screen.getByLabelText("نص الرسالة")).toBeDisabled();
  });

  it("enables the message field once the checkbox is checked", async () => {
    const user = userEvent.setup();
    render(<ClientDiscountForm onSubmit={vi.fn()} isSubmitting={false} />);

    await user.click(screen.getByRole("checkbox", { name: /إشعار العميل/ }));

    expect(screen.getByLabelText("نص الرسالة")).toBeEnabled();
  });

  it("blocks submit with a validation message when notify is on but the message is empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ClientDiscountForm onSubmit={onSubmit} isSubmitting={false} />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole("checkbox", { name: /إشعار العميل/ }));
    await user.click(screen.getByRole("button", { name: /حفظ الخصم/ }));

    await waitFor(() => {
      expect(screen.getByText("نص الرسالة مطلوب عند تفعيل إشعار العميل")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits notify_on_login=false and no message when the checkbox stays unchecked", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ClientDiscountForm onSubmit={onSubmit} isSubmitting={false} />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /حفظ الخصم/ }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.notifyOnLogin).toBe(false);
    expect(submitted.notificationMessage).toBeFalsy();
  });

  it("submits notify_on_login=true with the typed message when the checkbox is checked", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ClientDiscountForm onSubmit={onSubmit} isSubmitting={false} />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole("checkbox", { name: /إشعار العميل/ }));
    await user.type(screen.getByLabelText("نص الرسالة"), "تهانينا! حصلت على خصم");
    await user.click(screen.getByRole("button", { name: /حفظ الخصم/ }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.notifyOnLogin).toBe(true);
    expect(submitted.notificationMessage).toBe("تهانينا! حصلت على خصم");
  });
});

describe("ClientDiscountForm — discount type toggle", () => {
  it("defaults to نسبة % and switches to مبلغ ثابت on click", async () => {
    const user = userEvent.setup();
    render(<ClientDiscountForm onSubmit={vi.fn()} isSubmitting={false} />);

    const percentageBtn = screen.getByRole("button", { name: "نسبة %" });
    const fixedBtn = screen.getByRole("button", { name: "مبلغ ثابت (ر.س)" });
    expect(percentageBtn).toHaveAttribute("aria-pressed", "true");
    expect(fixedBtn).toHaveAttribute("aria-pressed", "false");

    await user.click(fixedBtn);

    expect(fixedBtn).toHaveAttribute("aria-pressed", "true");
    expect(percentageBtn).toHaveAttribute("aria-pressed", "false");
  });
});
