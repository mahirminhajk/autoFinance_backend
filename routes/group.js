import express from "express";
//* model
import Bank from "../models/Bank.js";
import Dealer from "../models/Dealer.js";

const router = express.Router();

//* get all employees and staffs
router.get("/", async (req, res, next) => {
  try {

    const filter = req.query.filter || "all";

    let banks;
    let dealers;
    let allEmployees = [];
    let allStaffs = [];
    let allDealers = [];
    let allEmployeesAndStaffs = [];

    //* filter
    if (filter === "manager") {
      banks = await Bank.find({}, "bankName employees");

      allEmployees = banks.reduce((employees, bank) => {
        //* Add bank details to each employee
        const bankEmployees = bank.employees.map((employee) => {
          return {
            ...employee._doc,
            bank: { _id: bank._id, bankName: bank.bankName },
          };
        });
        return employees.concat(bankEmployees);
      }, []);

      allEmployeesAndStaffs = allEmployees.filter((employee) => {
        return employee.role === "Manager";
      });
    } else if (filter === "executive") {
      banks = await Bank.find({}, "bankName employees");

      allEmployees = banks.reduce((employees, bank) => {
        //* Add bank details to each employee
        const bankEmployees = bank.employees.map((employee) => {
          return {
            ...employee._doc,
            bank: { _id: bank._id, bankName: bank.bankName },
          };
        });
        return employees.concat(bankEmployees);
      }, []);

      allEmployeesAndStaffs = allEmployees.filter((employee) => {
        return employee.role === "Employee";
      });
    } else if (filter === "staffs") {
      dealers = await Dealer.find({}, "name staffs");

      allEmployeesAndStaffs = dealers.reduce((staffs, dealer) => {
        //* Add dealer details to each staff
        const dealerStaffs = dealer.staffs.map((staff) => {
          return {
            ...staff._doc,
            dealer: { _id: dealer._id, name: dealer.name },
          };
        });
        return staffs.concat(dealerStaffs);
      }, []);
    } else if (filter === "dealer") {
      dealers = await Dealer.find({}, "name shopname phoneNo");

      allEmployeesAndStaffs = dealers.map((dealer) => {
        return {
          ...dealer._doc,
        };
      });
    } else {
      banks = await Bank.find({}, "bankName employees");
      dealers = await Dealer.find({}, "name shopname phoneNo staffs");

      //* Combine the employee data from banks and staffs from dealers
      allEmployees = banks.reduce((employees, bank) => {
        //* Add bank details to each employee
        const bankEmployees = bank.employees.map((employee) => {
          return {
            ...employee._doc,
            bank: { _id: bank._id, bankName: bank.bankName },
          };
        });
        return employees.concat(bankEmployees);
      }, []);

      allStaffs = dealers.reduce((staffs, dealer) => {
        //* Add dealer details to each staff
        const dealerStaffs = dealer.staffs.map((staff) => {
          return {
            ...staff._doc,
            dealer: { _id: dealer._id, name: dealer.name },
          };
        });
        return staffs.concat(dealerStaffs);
      }, []);

      //* set all dealers and remove staffs from dealers
      allDealers = dealers.map((dealer) => {
        return {
          ...dealer._doc,
        };
      });


      //* merage all employees, staffs and dealers
      allEmployeesAndStaffs = allEmployees.concat(allStaffs, allDealers);
    }

    //* res
    res.status(200).json(allEmployeesAndStaffs);
  } catch (error) {
    next(error);
  }
});

//* get search result
router.get('/search', async (req, res, next) => {
  try {
    const { query } = req.query;

    const dealerStaffsResult = await Dealer.find(
      {
        $or: [{ "staffs.name": { $regex: query, $options: "i" } }],
      },
      "name staffs"
    );

    const dealerSearchResult = await Dealer.find(
      {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { shopname: { $regex: query, $options: "i" } },
        ],
      },
      "name shopname phoneNo"
    );

    const banks = await Bank.find(
      {
        $or: [{ "employees.name": { $regex: query, $options: "i" } }],
      },
      "bankName employees"
    );

    //* Combine the employee data from banks and staffs from dealers
    const allEmployees = banks.reduce((employees, bank) => {
      //* Add bank details to each employee
      const bankEmployees = bank.employees.map((employee) => {
        return {
          ...employee._doc,
          bank: { _id: bank._id, bankName: bank.bankName },
        };
      });
      return employees.concat(bankEmployees);
    }, []);

    const allStaffs = dealerStaffsResult.reduce((staffs, dealer) => {
      //* Add dealer details to each staff
      const dealerStaffs = dealer.staffs.map((staff) => {
        return {
          ...staff._doc,
          dealer: { _id: dealer._id, name: dealer.name },
        };
      });
      return staffs.concat(dealerStaffs);
    }, []);

    const allDealers = dealerSearchResult.map((dealer) => {
      return {
        ...dealer._doc,
      };
    });

    //* Merge employees and staffs into a single array
    const allEmployeesAndStaffs = allEmployees.concat(allStaffs, allDealers);

    res.status(200).json(allEmployeesAndStaffs);

  } catch (error) {
    next(error)
  }
});

export default router;
