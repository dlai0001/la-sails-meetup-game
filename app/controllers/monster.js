import Ember from 'ember';

export default Ember.ObjectController.extend({
  computedStyle: function() {
    var model = this.get('model');

    return "position: absolute; " +
        'top: ' + model.get('xPosition') + 'px;' +
        "left:" + model.get('yPosition') + "px;";
  }.property('model.xPosition', 'model.yPosition')
});
