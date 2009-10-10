class AddMailboxToMessages < ActiveRecord::Migration
  def self.up
    add_column :messages, :mailbox, :string
  end

  def self.down
    remove_column :messages, :mailbox
  end
end
