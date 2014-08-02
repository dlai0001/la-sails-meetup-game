import Ember from 'ember';

export default Ember.ObjectController.extend({
  computedStyle: function() {
    var model = this.get('model');

    return "position: absolute; " +
        'top: ' + model.get('yPosition') + 'px;' +
        "left:" + model.get('xPosition') + "px;";
  }.property('model.xPosition', 'model.yPosition')
});
