import Ember from "ember";
export default Ember.Mixin.create({
    harmScoreList: [{
        label: "A   No Actual Event (Unsafe Condition)",
        value: "A"
    }, {
        label: "B1  Near Miss - The event did not reach the individual because of chance alone.",
        value: "B1"        
    }, {
        label: "B2  Near Miss - The event did not reach the individual because of active recovery efforts by caregivers.",
        value: "B2"
    }, {
        label: "C   The event reached the individual but did not cause harm.",
        value: "C"        
    }, {
        label: "D   The event reached the individual and required additional monitoring or treatment to prevent harm.",
        value: "D"
    }, {
        label: "E   The individual experienced temporary harm and required treatment or intervention.",
        value: "E"        
    }, {
        label: "F   The individual experienced temporary harm and required initial or prolonged hospitalization",
        value: "F"
    }, {
        label: "G   The individual experienced permanent harm.",
        value: "G"        
    }, {
        label: "H   The individual experienced permanent harm and required intervention necessary to sustain life (e.g. transfer to ICU)",
        value: "H"
    }, {
        label: "I   The individual died.",
        value: "I"        
    }]
});