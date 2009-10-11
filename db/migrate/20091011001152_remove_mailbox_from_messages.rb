class RemoveMailboxFromMessages < ActiveRecord::Migration
  def self.up
    remove_column :messages, :mailbox
  end

  def self.down
    add_column :messages, :mailbox, :string
  end
end
