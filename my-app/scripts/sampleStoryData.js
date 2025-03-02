const sampleStories = [
    {
      title: "The Mystery of Shadow Manor",
      description: "Explore an abandoned mansion filled with secrets, mysteries, and unexpected twists.",
      coverImage: "/assets/image/Mystery.png",
      authorId: "TCgtCL2798MGAS9XbUnjIo4JDdp1",
      status: "approved",
      branches: [
        {
          _id: "branch1_shadow_manor",
          text: "You stand at the rusted iron gates of Shadow Manor, the infamous abandoned mansion on the hill. Locals say it's been empty for decades, but sometimes lights can be seen moving through the windows at night. You've always been curious, and tonight seems like the perfect opportunity to investigate.\n\nThe moon is full, casting an eerie glow across the overgrown garden. The gate is slightly ajar, as if inviting you in. What will you do?",
          choices: [
            {
              text: "Push the gate open and enter the garden",
              nextBranchId: "branch2_shadow_manor"
            },
            {
              text: "Circle around to look for another entrance",
              nextBranchId: "branch3_shadow_manor"
            }
          ]
        },
        {
          _id: "branch2_shadow_manor",
          text: "With a creak that seems to echo through the night, the gate swings open. You step carefully onto the gravel path, now mostly covered with weeds. The manor looms ahead, its windows like dark eyes watching your approach.\n\nAs you make your way toward the main entrance, you notice something glinting in the moonlight near a cluster of dead roses. It appears to be a key, old and ornate.\n\nSuddenly, you hear a soft melody drifting from an open window on the second floor.",
          choices: [
            {
              text: "Take the key and head for the front door",
              nextBranchId: "branch4_shadow_manor"
            },
            {
              text: "Ignore the key and investigate the music",
              nextBranchId: "branch5_shadow_manor"
            }
          ]
        },
        {
          _id: "branch3_shadow_manor",
          text: "You decide to circle around the property, keeping to the shadows. The manor's grounds are extensive, with overgrown hedges and crumbling stone statues creating a labyrinth in the darkness.\n\nAfter several minutes, you discover a small outbuilding - perhaps once a gardener's shed or servant's quarters. The door is hanging off its hinges, and inside you can see what looks like a tunnel entrance.\n\nFrom somewhere inside the main house, you hear the faint sound of laughter.",
          choices: [
            {
              text: "Enter the tunnel",
              nextBranchId: "branch6_shadow_manor"
            },
            {
              text: "Abandon the tunnel and head toward the laughter",
              nextBranchId: "branch7_shadow_manor"
            }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      title: "Starship Endeavour",
      description: "Command your own spaceship and crew on a mission to explore the furthest reaches of the galaxy.",
      coverImage: "/assets/image/Starship.png",
      authorId: "Ed2pz7RH7GNuuBFTKqy4dUHJENE3",
      status: "approved",
      branches: [
        {
          _id: "branch1_endeavour",
          text: "Captain's Log, Stardate 2345.6: You've just been appointed captain of the Starship Endeavour, humanity's newest and most advanced vessel. Your mission: to explore the recently discovered wormhole near Saturn and determine if it offers safe passage to distant star systems.\n\nAs you settle into the captain's chair on the bridge, your first officer Commander Chen approaches with a data tablet.\n\n\"Captain, we're ready to depart from spacedock. Engineering reports the new quantum drive is operational but untested at full capacity. Science team is eager to begin scanning the wormhole. Your orders?\"",
          choices: [
            {
              text: "Set course for the wormhole, full speed ahead",
              nextBranchId: "branch2_endeavour"
            },
            {
              text: "Run a thorough systems check before departure",
              nextBranchId: "branch3_endeavour"
            }
          ]
        },
        {
          _id: "branch2_endeavour",
          text: "\"Let's not waste any time. Helmsman, set course for the Saturn wormhole, maximum speed.\"\n\nThe Endeavour smoothly departs from Earth's orbital station, accelerating rapidly as it clears the traffic control zone. The quantum drive hums with increasing intensity as your vessel achieves speeds no human ship has reached before.\n\nJust three hours later, your ship approaches the swirling vortex of the wormhole. Strange energy patterns dance across your sensors.\n\nSuddenly, a warning light flashes on the engineering console. Lieutenant Park reports, \"Captain, we're detecting quantum fluctuations in the drive. It's not dangerous yet, but these readings are... unexpected.\"",
          choices: [
            {
              text: "Proceed into the wormhole",
              nextBranchId: "branch4_endeavour"
            },
            {
              text: "Hold position and study the wormhole from a safe distance",
              nextBranchId: "branch5_endeavour"
            }
          ]
        },
        {
          _id: "branch3_endeavour",
          text: "\"Safety first, Commander. Let's run a full systems diagnostic before we depart.\"\n\nCommander Chen nods approvingly and begins the procedure. The comprehensive check takes several hours, during which your engineering team discovers and repairs a minor fluctuation in the quantum drive calibration.\n\n\"Good call, Captain,\" your chief engineer reports. \"That fluctuation might have caused problems if we'd pushed the engines too hard.\"\n\nWith all systems verified, you finally give the order to depart. The journey to Saturn is smooth and uneventful. As you approach the wormhole, your sensors detect an unidentified vessel already there, seemingly studying the phenomenon.",
          choices: [
            {
              text: "Hail the unknown vessel",
              nextBranchId: "branch6_endeavour"
            },
            {
              text: "Maintain distance and scan the vessel",
              nextBranchId: "branch7_endeavour"
            }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      title: "The Alchemist's Apprentice",
      description: "Learn the ancient arts of alchemy in a medieval world where magic and science blend together.",
      coverImage: "/assets/image/Alchemist.png",
      authorId: "LcHh5f6k9ZeWEHBWFKcwppt7bwn1",
      status: "approved",
      branches: [
        {
          _id: "branch1_alchemist",
          text: "The narrow streets of Aldermist are cloaked in morning fog as you make your way to Master Thaddeus's shop. After years of pleading, your parents have finally arranged an apprenticeship with the renowned alchemist. Today is your first day.\n\nYou arrive at a crooked building wedged between a bakery and a blacksmith. A worn sign displaying a mortar and pestle creaks in the breeze. You take a deep breath and knock on the door.\n\nIt swings open to reveal a cluttered workshop filled with bubbling flasks, strange artifacts, and shelves overflowing with ingredients both mundane and exotic. A hunched man with wild white hair and spectacles peers at you.\n\n\"Ah, the new apprentice,\" he mutters. \"Well, don't just stand there. Come in, come in! We have much to do.\"",
          choices: [
            {
              text: "Ask about the basic principles of alchemy",
              nextBranchId: "branch2_alchemist"
            },
            {
              text: "Offer to help organize the cluttered workshop",
              nextBranchId: "branch3_alchemist"
            }
          ]
        },
        {
          _id: "branch2_alchemist",
          text: "\"Master Thaddeus, I'd like to learn the basic principles of alchemy first, if I may.\"\n\nThe old alchemist's eyes light up. \"Eager for knowledge! Good, good. The principles are three: extraction, transformation, and amplification.\"\n\nHe guides you to a workbench and shows you various tools - mortars, filters, distillation apparatus. \"Today, we begin with extraction. Here is valerian root. Your task is to extract its essence.\"\n\nAs you begin grinding the root as instructed, you notice a strange book on a high shelf. Its binding seems to glow with a faint blue light.",
          choices: [
            {
              text: "Focus on the extraction task",
              nextBranchId: "branch4_alchemist"
            },
            {
              text: "Ask about the glowing book",
              nextBranchId: "branch5_alchemist"
            }
          ]
        },
        {
          _id: "branch3_alchemist",
          text: "\"Master Thaddeus, would it be helpful if I organized some of these supplies first?\"\n\nThe alchemist looks surprised, then chuckles. \"Practical minded, are you? Very well.\"\n\nHe points to several areas of the workshop that need attention. As you begin sorting ingredients and tools, you find yourself learning about them simply through handling and asking occasional questions.\n\nBeneath a pile of scrolls, you discover a small silver key with strange markings. When you show it to Master Thaddeus, he suddenly looks concerned.",
          choices: [
            {
              text: "Ask what the key opens",
              nextBranchId: "branch6_alchemist"
            },
            {
              text: "Apologize for disturbing his belongings and return to organizing",
              nextBranchId: "branch7_alchemist"
            }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      title: "Digital Detective",
      description: "Solve a high-tech mystery as a cybersecurity expert in the year 2042.",
      coverImage: "/assets/image/Digital.png",
      authorId: "OuZfSOJp0AWXrQ8Xa942oaj1Fht1",
      status: "pending",
      branches: [
        {
          _id: "branch1_detective",
          text: "New Angeles, 2042. The city's augmented reality layer is as much a part of the landscape as the physical buildings. As a digital detective for the Technology Crimes Division, you specialize in cases that bridge the virtual and real worlds.\n\nYour neural implant pings with an incoming call from Captain Diaz. \"We've got a situation at Nexus Tower. The building's AI security system has gone haywire - locked all the doors, trapped hundreds inside. System claims it's detected an intrusion, but corporate IT can't find any breach. Need you on site ASAP.\"\n\nOutside Nexus Tower, police drones establish a perimeter while worried faces press against the glass doors from inside. Your specialized access allows you to interface directly with the building's systems.",
          choices: [
            {
              text: "Do a direct neural interface with the building's AI",
              nextBranchId: "branch2_detective"
            },
            {
              text: "Run a diagnostic on the security logs from a safe distance",
              nextBranchId: "branch3_detective"
            }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  module.exports = sampleStories;