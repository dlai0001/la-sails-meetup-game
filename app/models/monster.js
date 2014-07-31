import DS from 'ember-data';

export default DS.Model.extend({
  xPosition: DS.attr('number'),
  yPosition: DS.attr('number')
});
