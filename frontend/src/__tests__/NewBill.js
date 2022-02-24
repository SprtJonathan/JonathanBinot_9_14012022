/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { bills } from "../fixtures/bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    /*test("Then ...", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
    });*/

    test("Then the text send a new bill should be rendered", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });

    test("Then the new bill's form should be loaded with its fields", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      // Récupération des
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      expect(screen.getByTestId("expense-type")).toBeTruthy();
      expect(screen.getByTestId("expense-name")).toBeTruthy();
      expect(screen.getByTestId("datepicker")).toBeTruthy();
      expect(screen.getByTestId("amount")).toBeTruthy();
      expect(screen.getByTestId("vat")).toBeTruthy();
      expect(screen.getByTestId("pct")).toBeTruthy();
      expect(screen.getByTestId("commentary")).toBeTruthy();
      expect(screen.getByTestId("file")).toBeTruthy();
      expect(screen.getByTestId("button")).toBeTruthy();
    });
    describe("When I upload an image in file input", () => {
      test("Then the file should be uploaded", async () => {
        document.body.innerHTML = NewBillUI();

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        const newBill = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });

        const changeFile = jest.fn((e) => newBill.handleChangeFile(e));
        const file = new File(["test.jpg"], "test.jpg", { type: "image/jpg" });

        const input = screen.getByTestId("file");
        input.addEventListener("change", changeFile);

        userEvent.upload(input, file);

        expect(changeFile).toHaveBeenCalled();

        expect(input.files[0]).toStrictEqual(file);
        expect(input.files.item(0)).toStrictEqual(file);
        expect(input.files).toHaveLength(1);
      });
    });
  });
});
