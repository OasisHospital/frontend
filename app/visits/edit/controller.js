import AbstractEditController from 'hospitalrun/controllers/abstract-edit-controller';
import AddDiagnosisModel from 'hospitalrun/models/add-diagnosis';
import ChargeActions from 'hospitalrun/mixins/charge-actions';
import Ember from "ember";
import PatientSubmodule from 'hospitalrun/mixins/patient-submodule';
import UserSession from "hospitalrun/mixins/user-session";
import VisitTypes from 'hospitalrun/mixins/visit-types';

export default AbstractEditController.extend(ChargeActions, PatientSubmodule, UserSession, VisitTypes, {
    needs: 'visits',
    
    canAddAppointment: function() {        
        return this.currentUserCan('add_appointment');
    }.property(),    

    canAddImaging: function() {
        return this.currentUserCan('add_imaging');
    }.property(),    

    canAddLab: function() {        
        return this.currentUserCan('add_lab');
    }.property(),    
    
    canAddMedication: function() {        
        return this.currentUserCan('add_medication');
    }.property(),
    
    canAddDiagnosis: function() {        
        return this.currentUserCan('add_diagnosis');
    }.property(),    

    canAddProcedure: function() {        
        return this.currentUserCan('add_procedure');
    }.property(),
    
    canAddVitals: function() {        
        return this.currentUserCan('add_vitals');
    }.property(),
    
    canDeleteDiagnosis: function() {        
        return this.currentUserCan('delete_diagnosis');
    }.property(),
    
    canDeleteImaging: function() {
        return this.currentUserCan('delete_imaging');
    }.property(),        
    
    canDeleteLab: function() {        
        return this.currentUserCan('delete_lab');
    }.property(),        
    
    canDeleteMedication: function() {        
        return this.currentUserCan('delete_medication');
    }.property(),

    canDeleteProcedure: function() {        
        return this.currentUserCan('delete_procedure');
    }.property(),
    
    canDeleteVitals: function() {        
        return this.currentUserCan('delete_vitals');
    }.property(),
    
    disabledAction: function() {
        this.get('model').validate();
        this._super();
    }.property('endDate', 'startDate', 'isValid'),
    
    isAdmissionVisit: function() {
        var visitType = this.get('visitType'),
            isAdmission = (visitType === 'Admission');
        if (isAdmission) {
            this.set('outPatient', false);
        } else {
            this.set('status');
            this.set('outPatient', true);
        }
        return isAdmission;
    }.property('visitType'),
    
    startDateChanged: function() {
        var isAdmissionVisit = this.get('isAdmissionVisit'), 
            startDate = this.get('startDate');
        if (!isAdmissionVisit) {
            this.set('endDate', startDate);
        }
    }.observes('isAdmissionVisit', 'startDate'),
    
    cancelAction: 'returnToPatient',
    chargePricingCategory: 'Ward',
    chargeRoute: 'visits.charge',
    dateTimeFormat: 'l h:mm A',
    diagnosisList: Ember.computed.alias('controllers.visits.diagnosisList'),
    findPatientVisits: false,
    pricingList: null, //This gets filled in by the route
    pricingTypes: Ember.computed.alias('controllers.visits.wardPricingTypes'),
    physicianList: Ember.computed.alias('controllers.visits.physicianList'),
    locationList: Ember.computed.alias('controllers.visits.locationList'),
    visitTypesList: Ember.computed.alias('controllers.visits.visitTypeList'),
    lookupListsToUpdate: [{
        name: 'diagnosisList',
        property: 'primaryBillingDiagnosis',
        id: 'diagnosis_list'
    }, {
        name: 'diagnosisList',
        property: 'primaryDiagnosis',
        id: 'diagnosis_list'
    }, {
        name: 'physicianList',
        property: 'examiner',
        id: 'physician_list'
    }, {
        name: 'locationList',
        property: 'location',
        id: 'visit_location_list'
    }],
    
    newVisit: false,
    visitStatuses: [
        'Admitted',
        'Discharged'
    ],

    updateCapability: 'add_visit',
    
    _finishAfterUpdate: function() {
        this.displayAlert('Visit Saved', 'The visit record has been saved.');
    },

    haveAdditionalDiagnoses: function() {
        return !Ember.isEmpty(this.get('additionalDiagnoses'));
    }.property('additionalDiagnoses.@each'),

    afterUpdate: function() {
        var patient = this.get('patient'),
            patientAdmitted = patient.get('admitted'),
            patientUpdated = false,
            status = this.get('status');
        if (status === 'Admitted' && !patientAdmitted) {
            patient.set('admitted', true);
            patientUpdated = true;
        } else if (status === 'Discharged' && patientAdmitted) {
            this.getPatientVisits(patient).then(function(visits)  {
                if (Ember.isEmpty(visits.findBy('status', 'Admitted'))) {
                    patient.set('admitted', false);
                    patientUpdated = true;
                }                    
            }.bind(this));
        }
        if (patientUpdated) {
            patient.save().then(this._finishAfterUpdate.bind(this));
        } else {
            this.displayAlert('Visit Saved', 'The visit record has been saved.');
        }
    },
    
    beforeUpdate: function() {        
        if (this.get('isNew')) {
            this.set('newVisit', true);
        }
        return new Ember.RSVP.Promise(function(resolve, reject) {
            this.updateCharges().then(resolve, reject);
        }.bind(this));
    },
    
    /**
     * Adds or removes the specified object from the specified list.
     * @param {String} listName The name of the list to operate on.
     * @param {Object} listObject The object to add or removed from the
     * specified list.
     * @param {boolean} removeObject If true remove the object from the list;
     * otherwise add the specified object to the list.
     */
    updateList: function(listName, listObject, removeObject) {
        this.get(listName).then(function(list) {
            if (removeObject) {
                list.removeObject(listObject);
            } else {
                list.addObject(listObject);
            }
            this.send('update', true);
            this.send('closeModal');
        }.bind(this));
    },
    
    actions: {
        addDiagnosis: function(newDiagnosis) {
            var additionalDiagnoses = this.get('additionalDiagnoses');
            if (!Ember.isArray(additionalDiagnoses)) {
                additionalDiagnoses = [];
            }
            additionalDiagnoses.addObject(newDiagnosis);
            this.set('additionalDiagnoses', additionalDiagnoses);
            this.send('update', true);
            this.send('closeModal');
        },
        
        deleteDiagnosis: function(diagnosis) {
            var additionalDiagnoses = this.get('additionalDiagnoses');
            additionalDiagnoses.removeObject(diagnosis);
            this.set('additionalDiagnoses', additionalDiagnoses);
            this.send('update', true);
        },        
        
        addVitals: function(newVitals) {
            this.updateList('vitals', newVitals);
        },
        
        cancel: function() {
            var cancelledItem = this.get('model');
            if (this.get('isNew')) {
                cancelledItem.deleteRecord();
            } else {
                cancelledItem.rollback();
            }
            this.send(this.get('cancelAction'));
        },
        
        deleteProcedure: function(procedure) {
            this.updateList('procedures', procedure, true);
        },
        
        deleteVitals: function(vitals) {
            this.updateList('vitals', vitals, true);
        },
        
        editImaging: function(imaging) {
            imaging.setProperties({
                'isCompleting': false,
                'returnToVisit': true
            });
            this.transitionToRoute('imaging.edit', imaging);
        },        
        
        editLab: function(lab) {
            lab.setProperties({
                'isCompleting': false,
                'returnToVisit': true
            });
            this.transitionToRoute('labs.edit', lab);
        },
        
        editMedication: function(medication) {
            medication.set('returnToVisit', true);
            this.transitionToRoute('medication.edit', medication);
        },
        
        showAddVitals: function() {
            var newVitals = this.get('store').createRecord('vital', {
                dateRecorded: new Date()
            });
            this.send('openModal', 'visits.vitals.edit', newVitals);
        },
        
        newAppointment: function() {
            var now = moment().hours(8).minutes(0).seconds(0).toDate();
            var newAppointment = this.get('store').createRecord('appointment', {
                patient: this.get('patient'),
                startDate: now,
                endDate: now,
                returnToVisit: true,
                visit: this.get('model')                
            });
            newAppointment.set('returnToVisit', true);
            this.transitionToRoute('appointments.edit', newAppointment);
        },
        
        newImaging: function() {
            var newImaging = this.get('store').createRecord('imaging', {
                isCompleting: false,
                patient: this.get('patient'),
                visit: this.get('model'),
                returnToVisit: true
            });            
            this.transitionToRoute('imaging.edit', newImaging);
        },

        newLab: function() {
            var newLab = this.get('store').createRecord('lab', {
                isCompleting: false,
                patient: this.get('patient'),
                visit: this.get('model'),
                returnToVisit: true
            });            
            this.transitionToRoute('labs.edit', newLab);
        },        

        newMedication: function() {
            var newMedication = this.get('store').createRecord('medication', {
                prescriptionDate: moment().startOf('day').toDate(),
                patient: this.get('patient'),
                visit: this.get('model'),
                returnToVisit: true
            });            
            this.transitionToRoute('medication.edit', newMedication);
        },
        
        showAddDiagnosis: function() {
            this.send('openModal', 'visits.add-diagnosis', AddDiagnosisModel.create());
        },
        
        showAddProcedure: function() {
            var newProcedure = this.get('store').createRecord('procedure', {
                procedureDate: new Date(),
                visit: this.get('model'),
            });
            this.transitionToRoute('procedures.edit', newProcedure);
        },

        showDeleteImaging: function(imaging) {
            this.send('openModal', 'imaging.delete', imaging);
        },

        showDeleteLab: function(lab) {
            this.send('openModal', 'labs.delete', lab);
        },
        
        showDeleteMedication: function(medication) {
            this.send('openModal', 'medication.delete', medication);
        },    
        
        showDeleteProcedure: function(procedure) {
            this.send('openModal', 'visits.procedures.delete', procedure);
        },
        
        showDeleteVitals: function(vitals) {
            this.send('openModal', 'visits.vitals.delete', vitals);
        },

        showEditProcedure: function(procedure) {
            if (Ember.isEmpty(procedure.get('visit'))) {
                procedure.set('visit', this.get('model'));
            }
            procedure.set('returnToVisit', true);
            procedure.set('returnToPatient', false);            
            this.transitionToRoute('procedures.edit', procedure);
        },
        
        showEditVitals: function(vitals) {
            this.send('openModal', 'visits.vitals.edit', vitals);
        }
    }
});
