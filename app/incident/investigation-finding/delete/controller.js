import AbstractDeleteController from 'hospitalrun/controllers/abstract-delete-controller';
import Ember from "ember";
export default AbstractDeleteController.extend({
    needs: 'incident/edit',
    
    afterDeleteAction: 'notifyInvestigationFindingDelete',
    editController: Ember.computed.alias('controllers.incident/edit'),
    title: 'Delete Investigation Finding',
    
    actions: {
        notifyInvestigationFindingDelete: function() {
            this.get('model').destroyRecord().then(function() {                    
                this.send('closeModal');
            }.bind(this));
            this.get('editController').send('deleteInvestigationFinding', this.get('model'));
        }
    }
});