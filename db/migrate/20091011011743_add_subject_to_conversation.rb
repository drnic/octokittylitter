class AddSubjectToConversation < ActiveRecord::Migration
  def self.up
    add_column :conversations, :subject, :string
    remove_column :messages, :subject
  end

  def self.down
    add_column :messages, :subject, :string
    remove_column :conversations, :subject
  end
end
