/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
jest.mock("../app/store", () => mockStore);

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

    describe("When I fill a form with valid fields and I submit it", () => {
      test("Then the form is submitted to the api and a new bill is created", () => {
        const onNavigate = (pathname) =>
          (document.body.innerHTML = ROUTES({ pathname }));

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        const html = NewBillUI();
        document.body.innerHTML = html;

        const newBill = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });

        const billData = {
          email: "employee@test.tld",
          type: "Transport",
          name: "New bill test",
          amount: 150,
          date: "2022/03/01",
          vat: "80",
          pct: 20,
          commentary: "Lorem ipsum dolor sit amet",
          fileUrl: "test.png",
          fileName: "NewBill Test",
          status: "pending",
        };

        const inputTypeBill = screen.getByTestId("expense-type");
        fireEvent.change(inputTypeBill, {
          target: { value: billData.type },
        });

        const inputNameBill = screen.getByTestId("expense-name");
        fireEvent.change(inputNameBill, {
          target: { value: billData.name },
        });

        const inputAmountBill = screen.getByTestId("amount");
        fireEvent.change(inputAmountBill, {
          target: { value: billData.amount },
        });

        const inputDateBill = screen.getByTestId("datepicker");
        fireEvent.change(inputDateBill, {
          target: { value: billData.date },
        });

        const inputVatBill = screen.getByTestId("vat");
        fireEvent.change(inputVatBill, {
          target: { value: billData.vat },
        });

        const inputPctBill = screen.getByTestId("pct");
        fireEvent.change(inputPctBill, {
          target: { value: billData.pct },
        });

        const inputCommentaryBill = screen.getByTestId("commentary");
        fireEvent.change(inputCommentaryBill, {
          target: { value: billData.commentary },
        });

        newBill.fileUrl = billData.fileUrl;
        newBill.fileName = billData.fileName;

        const newBillForm = screen.getByTestId("form-new-bill");

        const handleSubmit = jest.fn(newBill.handleSubmit);

        newBillForm.addEventListener("submit", handleSubmit);

        fireEvent.submit(newBillForm);

        expect(handleSubmit).toHaveBeenCalled();
      });

      test("Then the page should return to the dashboard", () => {
        expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
      });
    });
    describe("When I upload a file with an incorrect file extension", () => {
      test("Then an error should be returned", () => {
        const onNavigate = (pathname) =>
          (document.body.innerHTML = ROUTES({ pathname }));

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        document.body.innerHTML = NewBillUI();

        const newBill = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });
        const inputFile = screen.getByTestId("file");
        fireEvent.change(inputFile, {
          target: {
            files: [
              new File(["image.gif"], "image.gif", { type: "image/gif" }),
            ],
          },
        });

        const error = screen.getByTestId("error-message");
        expect(error).toBeTruthy();
        expect(inputFile.classList.contains("is-invalid")).toBeTruthy();
      });
      test("Then if user replace the invalid file", async () => {
        const onNavigate = (pathname) =>
          (document.body.innerHTML = ROUTES({ pathname }));

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        document.body.innerHTML = NewBillUI();

        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const inputFile = screen.getByTestId("file");

        const error = document.createElement("span");
        error.innerHTML =
          "Veuillez envoyer des fichiers de type JPG, JPEG ou PNG uniquement";
        error.classList.add("invalid-feedback");
        error.setAttribute("data-testid", "error-message");
        inputFile.parentNode.append(error);

        inputFile.classList.remove("blue-border");
        inputFile.classList.add("is-invalid");

        fireEvent.change(inputFile, {
          target: {
            files: [
              new File(["image.jpeg"], "image.jpeg", { type: "image/jpeg" }),
            ],
          },
        });

        expect(inputFile.classList.contains("is-invalid")).toBeFalsy();
        expect(inputFile.classList.contains("blue-border")).toBeTruthy();
      });
    });
  });
});
