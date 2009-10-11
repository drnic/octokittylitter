class AddToAndFromToMessages < ActiveRecord::Migration
  def self.up
    rename_column :messages, :from_github_login, :to
    add_column :messages, :from, :string
  end

  def self.down
    rename_column :messages, :to, :from_github_login
    remove_column :messages, :from
  end
end
