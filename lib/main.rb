require 'discordrb'
require 'dotenv/load'

bot = Discordrb::Bot.new token: ENV['TOKEN'], fancy_log: true, ignore_bots: true, intents: [:server_messages, :servers]

bot.ready do |event|
  puts 'Ready!'

  channel = bot.channel ENV['CHANNEL']
  server = channel.server
  messages = channel.history 1

  if messages.size == 0
    roles = [
      server.role(ENV['ROLE_1'])
    ]

    component = Discordrb::Components::View.new do |view|
      view.row do |row|
        roles.each do |role|
          row.button(
            label: role.name,
            style: :primary,
            custom_id: "role_#{role.id}"
          )
        end
      end
    end

    channel.send_message(
      'Minehut+ allows you to easily add or remove roles so you can decide what you get pinged for. Please click any button to receive a role.',
      false, nil, nil, nil, nil,
      component
    )
  end
end

bot.button(custom_id: /^role_/) do |event|
  id = event.interaction.button.custom_id.split('_')[1].to_i
  role = event.server.role id
  member = event.server.member event.user.id

  if member.role? id
    member.remove_role(role, "Removed notification role")
    event.respond(content: "You've lost the `#{role.name}` role.", ephemeral: true)
    member.roles.delete role
  else
    member.add_role(role, "Added notification role")
    event.respond(content: "You've received the `#{role.name}` role.", ephemeral: true)
    member.roles << role
  end
end

bot.run
