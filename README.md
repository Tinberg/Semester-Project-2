
- my-profile, make loader for each tab (listing, bid activity and auctions won)
- make hover like explore on eall tabs

make btn in listing.html disabled if its the users listing
make listing won in profile right



- explenation for innerHTML on profiles and createElement and appendchild on explore

I went with innerHTML for profiles since they're less content-heavy, making it easier to maintain clear code for different layouts. But for the Explore page with lots of listings, I used createElement() and appendChild() to dodge any potential slowdowns from the large content load.