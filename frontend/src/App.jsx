import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Forgotpassword from "./forgotpassword/Forgotpassword";
import Signup from "./signup/Signup";
import Signin from "./signin/Signin";
import Checkemail from "./checkemail/Checkemail";
import ResetPassword from "./resetpassword/Resetpassword";
import Passwordchanged from "./passwordchanged/Passwordchanged";
import Emailsent from "./emailsent/Emailsent";
import  StackedBarComponent from "./ChartsComponents/stackedBar";
import  LineChartComponent from "./ChartsComponents/LineChart";
import  ColumnChart from "./ChartsComponents/ColumnChart";
import  PieChartCom from "./ChartsComponents/PieChart";
import Doctors from "./AdminComponents/Doctors";
import Home from "./Home";
import Dashboard from "./AdminComponents/Dashboard";
import Users from "./AdminComponents/Users";
import MedicalForm from './medicalcomponents/MedicalForm';
import User from './medicalcomponents/Users';
import AddFile from './medicalcomponents/AddFile';
import  PatientPhoto  from './medicalcomponents/image';
import Medecin from './medicalcomponents/Medecin';
import DashboardM from './medicalcomponents/Dashboard';
import ConsultationForm from './consultationcomp/ConsultationForm'
import ConsultationList from './consultationcomp/ConsultationList'
import ExamenPhysique from './consultationcomp/ExamenPhysique'
import Ordonnance from './consultationcomp/Ordonnance'
import Archive from "./AdminComponents/Archive";
import Settings from "./AdminComponents/Settings";
import RendezVous from "./doctorcomponents/RendezVous";
import TabRendezvous from "./doctorcomponents/TabRendezvous";
import Directeur from "./DirecteurComponents/Directeur";
{/*import FaceDetectionUploader from "./FaceDetectionComponents/FaceDetectionUploader";*/}

const NotFound = () => <div>404 Not Found</div>;

function App() {
  return (

    <Router>
      <Routes>

      <Route path="/" element={<Signin />} />
      <Route path="/pie" element={<PieChartCom />} />
       <Route path="/ordonnace" element={<Ordonnance /> } />
       <Route caseSensitive path="/dashboard" element={<DashboardM /> } />
       <Route path="/ordonnace/:id_consultation" element={<Ordonnance /> } />


       <Route path="/listeconsultation" element={<ConsultationList/>} />
       <Route path="/listeconsultation/:email" element={<ConsultationList/>} />
       <Route path="/examenphysique" element={<ExamenPhysique />} />
       <Route path="/examenphysique/:id_consultation" element={<ExamenPhysique />} />
       <Route path="/consultation" element={<ConsultationForm />} />
       <Route path="/consultation/:id_consultation" element={<ConsultationForm />} />
       <Route path="/medicalform/:email" element={<MedicalForm />} />
        <Route path="/user" element={<User/>} />
        <Route path="/medecin/:email" element={<Medecin />} />
       <Route path="/addfile" element={<AddFile/>} />
       <Route path="/addfile/:email" element={<AddFile />} />
       <Route  path="/medicalform" element={<MedicalForm/>}/>
        <Route path="/home" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotpassword" element={<Forgotpassword />} />
        <Route path="/checkemail" element={<Checkemail />} />
        <Route path="/resetPassword/:token" element={<ResetPassword />} />
        <Route path="/passwordchanged" element={<Passwordchanged />} />
        <Route path="/emailsent" element={<Emailsent />} />
        <Route path="/Doc" element={<Doctors />} />
        <Route caseSensitive path="/Dashboard" element={<Dashboard />} />
        <Route path="/Users" element={<Users />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />{" "}
        <Route path="/RendezVous" element={<RendezVous />} />
        <Route path="/directeur" element={<Directeur/>} />
        <Route path="/TabRendezvous/:email" element={<TabRendezvous />} />


        {/* Catch-all for unknown routes */}
      </Routes>
    </Router>
  );
}
export default App;
