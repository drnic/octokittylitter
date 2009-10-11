class RemoveGithubMessageNumberFromMessages < ActiveRecord::Migration
  def self.up
    remove_column :messages, :github_message_number
  end

  def self.down
    add_column :messages, :github_message_number, :string
  end
end
