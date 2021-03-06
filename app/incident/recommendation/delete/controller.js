import AbstractDeleteController from 'hospitalrun/controllers/abstract-delete-controller';
import Ember from "ember";
export default AbstractDeleteController.extend({
    needs: 'incident/edit',
    
    afterDeleteAction: 'notifyRecommendationDelete',
    editController: Ember.computed.alias('controllers.incident/edit'),
    title: 'Delete Recommendation',
    
    actions: {
        notifyRecommendationDelete: function() {
            this.get('model').destroyRecord().then(function() {                    
                this.send('closeModal');
            }.bind(this));
            this.get('editController').send('deleteRecommendation', this.get('model'));
        }
    }
});