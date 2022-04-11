/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    /*test("Then ...", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
    });*/

    // On teste le fait que le texte envoyer une note de frais est bien présent sur la page NewBillUI, prouvant que la page est chargée
    test("Then the text send a new bill should be rendered", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });

    // Test sur le formulaire.
    describe("When I fill a form and I submit it", () => {
      // On vérifie qu'en remplissant un formulaire et en faisant l'envoi à l'API, une nouvelle note de frais est créée
      test("Then the function used for submitting the form is called", () => {
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

        

        const newBillForm = screen.getByTestId("form-new-bill");

        const handleSubmit = jest.fn(newBill.handleSubmit); // Simule la fonction permettant d'envoyer le formulaire

        newBillForm.addEventListener("submit", handleSubmit);

        fireEvent.submit(newBillForm);

        // On s'attend à ce que la fonction chargée de soumettre le formulaire soit appellée (aucune vérification du form)
        expect(handleSubmit).toHaveBeenCalled();
      });

      // Lorsqu'une nouvelle note de frais est créée, alors la page doit revenir au tableau de bord
      test("Then the page should return to the dashboard", () => {
        expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
      });
    });
    // Test de la réaction du programme lorsqu'un fichier de format incorrect est envoyé
    describe("When I upload a file with an incorrect file extension", () => {
      // On vérifie qu'une erreur soit bien retournée
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

        // Récupération de l'input permettant d'envoyer un fichier
        const inputFile = screen.getByTestId("file");
        fireEvent.change(inputFile, {
          target: {
            files: [
              new File(["image.gif"], "image.gif", { type: "image/gif" }),
            ],
          },
        });

        // Récupération du message d'erreur sur la page
        const error = screen.getByTestId("error-message");
        expect(error).toBeTruthy(); // On s'attend à voir un message d'erreur

        // On s'attend à ce que l'input contiennent dans sa classe "is-invalid"
        expect(inputFile.classList.contains("is-invalid")).toBeTruthy();
      });
      // Test sur le remplacement du fichier invalide par un valide
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
    describe("When I submit a new bill and return to Bill Page", () => {
      test("fetches bills from mock API GET", async () => {
        // Création de l'objet contenant les informations de la facture

        // Importer un mock depuis le fichier store
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

        const postSpy = jest.spyOn(mockStore, "bills");
        const bills = await mockStore.bills(billData);

        expect(postSpy).toHaveBeenCalledTimes(1); // On s'attend à ce que la méthode bills() soit appelée
        expect(bills).toBeTruthy();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 404"))
        );
        const html = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 500"))
        );
        const html = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
