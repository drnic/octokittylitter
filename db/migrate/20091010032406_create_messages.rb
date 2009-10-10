class CreateMessages < ActiveRecord::Migration
  def self.up
    create_table :messages do |t|
      t.string :from_github_login
      t.datetime :sent_at
      t.text :message
      t.string :github_id

      t.timestamps
    end
  end

  def self.down
    drop_table :messages
  end
end
