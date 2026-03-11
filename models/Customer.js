import mongoose, { Schema } from 'mongoose';


//* schema
//? doc schema
const docSchema = new Schema({
  docname: {
    type: String,
    require: [true, 'Add a Doc name'],
    // enum: ['Passport', 'Pan', 'Aadhaar', 'Photo', 'Licence', 'RC', 'Insurance', 'Voter ID',]
  },
  img1: String,
  img2: String,
  verifydoc: Object,
  status: {
    type: String,
    default: 'uploading',
    enum: ['uploading', 'updating', 'done']
  }
});

//? schema with head and value
const headValueSchema = new Schema({
  head: {
    type: String,
  },
  values: Object,
}, { _id: false });


const carSchema = new Schema({
  carName: String,
  model: String,
  regNo: String,
  ownership: {
    type: Number,
    default: 0,
  },
  vehicleLocation: String,
  km: {
    type: Number,
    default: 0,
  },
}, { _id: false });


const generalSchema = new Schema({
  name: String,
  firstName: String,
  lastName: String,
  phoneNo: String,
  category: {
    type: String,
    default: 'Gold',
    enum: ['Gold', 'Platinum', 'Diamond'],
  },
  status: {
    type: String,
    default: 'pending',
    //TODO: rename conform to confirm 
    enum: ['pending', 'unconform3', 'unconform2', 'unconform1', 'conform', 'upload_docs', 'verification', 'ready_login', 'login', 'ftr', 'loan_approved', 'loan_desp', 'rto_work', 'completed', "reject", "pending_doc"]
  },
  email: String,
  //? dealer
  dealer: {
    type: Schema.Types.ObjectId,
    ref: 'Dealer'
  },
  //? car
  car: carSchema,
  //? bank
  bank: {
    type: Schema.Types.ObjectId,
    ref: 'Bank'
  },
  executive: String,
  manager: String,
  valuationDetails: String,

  valuationCompanyName: String,
  valuationAmount: String,
  valuationPlace: String,
  valuationMobileNumber: String,
  valuationFreeTime: String,
  valuationVehicleHolderName: String,
  
  method: String,
  policy: String,
  insuranceDate: Date,
  insuranceType: String,
  dealerName: String,
  oldOwnerPh: String,
  customerVehicleLocation: String,
  dealerName: String,
  oldOwnerPhoneNumber: String,
  initalCheckup: [headValueSchema],
}, { _id: false })

const statusHistorySchema = new Schema({
  status: String,
  date: { type: Date, default: Date.now() },
  updatedBy: String
}, { _id: false })

//? customer schema
const customerSchema = new Schema(
  {
    general: generalSchema,
    statusHistory: [statusHistorySchema],
    docuploads: {
      type: [docSchema],
    },
    //? verification
    verification: [headValueSchema],

    //? ready login
    readyLogin: [headValueSchema],

    //? Login
    login: {
      loginStatus: Boolean,
      updatedBy: String,
      updatedAt: Date,
    },

    //? FTR
    ftr: {
      type: Object,
    },

    //?loan
    loan: {
      type: Schema.Types.ObjectId,
      ref: "Loan",
    },

    loanApproved: [headValueSchema],

    //? loan desp
    loanDesp: {
      type: Object,
    },

    //? rto work
    rtoWork: {
      type: Object,
    },

    //? completed
    completed: {
      type: Object,
    },

    //? Message Send info
    messSendInfo: [Object],
    index: {
      type: Number,
      unique: true,
    }
  },
  { timestamps: true }
);

//* pre-save middleware to combine firstName and lastName
customerSchema.pre('save', async function (next) {
  const customer = this;
  //* check if the firstName field has been modified
  if (customer.isModified('general.firstName')) {
    //* check if lastName is defined and not null
    if (customer.general.lastName && customer.general.lastName.trim() !== '') {
      //* combine the first and last name
      customer.general.name = `${customer.general.firstName} ${customer.general.lastName}`;
    } else {
      //* use only the firstName as name
      customer.general.name = customer.general.firstName;
    }
  }
  if (customer.isModified('general.phoneNo')) {
    //* check if the phoneNo starts with 91
    if (!customer.general.phoneNo.startsWith('91')) {
      //* add 91 to the phoneNo
      customer.general.phoneNo = `91${customer.general.phoneNo}`;
    }
  }

  //* set the index field, if it's a new document
  if (customer.isNew) {
    try {
      // find the highest existing index and increment it by 1
      const lastCustomer = await mongoose
        .model('Customer')
        .findOne({}, { index: 1 })
        .sort({ index: -1 })
        .lean();
      const lastIndex = (lastCustomer && typeof lastCustomer.index === 'number') ? lastCustomer.index : 0;
      customer.index = lastIndex + 1;
    } catch (error) {
      return next(error)
    }
  }


  next();
});


//* export model
export default mongoose.model('Customer', customerSchema);