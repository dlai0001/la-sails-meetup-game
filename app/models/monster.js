import DS from 'ember-data';

export default DS.Model.extend({
  id: DS.attr('number'),
  xPosition: DS.attr('number'),
  yPosition: DS.attr('number')
});
