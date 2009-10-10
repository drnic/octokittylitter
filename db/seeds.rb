require "spec/blueprints"

def regenerate_seeds(klass, count)
  klass.delete_all
  count.times {|n| klass.make}
  puts "Generated #{count} #{klass.name.underscore.humanize.pluralize.downcase}."
end

regenerate_seeds(Message, 100)
