import DS from 'ember-data';

export default DS.Model.extend({
  xPosition: DS.attr('number'),
  yPosition: DS.attr('number'),

  autosubscribe: true // auto subsubscribe to published updates
});
