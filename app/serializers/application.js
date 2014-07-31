import DS from 'ember-data';
import Ember from 'ember';

export default DS.JSONSerializer.extend({

  extractArray: function(store, type, arrayPayload) {
    var serializer = this;
    return Ember.ArrayPolyfills.map.call(arrayPayload, function(singlePayload) {
      return serializer.extractSingle(store, type, singlePayload);
    });
  },

  serializeIntoHash: function(hash, type, record, options) {
    Ember.merge(hash, this.serialize(record, options));
  }

});