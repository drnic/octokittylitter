class ChangeMessageToBodyOnMessages < ActiveRecord::Migration
  def self.up
    rename_column :messages, :message, :body
  end

  def self.down
    rename_column :messages, :body, :message
  end
end
