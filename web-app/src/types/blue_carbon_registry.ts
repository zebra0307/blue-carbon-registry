import { PublicKey } from '@solana/web3.js';

export type BlueCarbonRegistry = {
  "address": string;
  "metadata": {
    "name": "blue_carbon_registry";
    "version": "0.1.0";
    "spec": "0.1.0";
    "description": "Created with Anchor";
  };
  "instructions": [
    {
      "name": "mintCredits";
      "docs": [
        "Mints new carbon credits (SPL tokens) to a recipient.",
        "This instruction uses Cross-Program Invocation (CPI) to call the SPL Token Program."
      ];
      "accounts": [
        {
          "name": "mint";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "project";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "owner";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "recipientTokenAccount";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "mintAuthority";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "tokenProgram";
          "isMut": false;
          "isSigner": false;
        }
      ];
      "args": [
        {
          "name": "amount";
          "type": "u64";
        }
      ];
    },
    {
      "name": "registerProject";
      "docs": [
        "Registers a new carbon credit project"
      ];
      "accounts": [
        {
          "name": "project";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "projectOwner";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        }
      ];
      "args": [
        {
          "name": "projectId";
          "type": "string";
        },
        {
          "name": "ipfsCid";
          "type": "string";
        }
      ];
    },
    {
      "name": "retireCredits";
      "docs": [
        "Retires carbon credits permanently"
      ];
      "accounts": [
        {
          "name": "retirementAccount";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "fromAuthority";
          "isMut": false;
          "isSigner": true;
        },
        {
          "name": "tokenProgram";
          "isMut": false;
          "isSigner": false;
        }
      ];
      "args": [
        {
          "name": "amount";
          "type": "u64";
        }
      ];
    },
    {
      "name": "transferCredits";
      "docs": [
        "Transfers carbon credits between accounts"
      ];
      "accounts": [
        {
          "name": "fromAccount";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "toAccount";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "fromAuthority";
          "isMut": false;
          "isSigner": true;
        },
        {
          "name": "tokenProgram";
          "isMut": false;
          "isSigner": false;
        }
      ];
      "args": [
        {
          "name": "amount";
          "type": "u64";
        }
      ];
    }
  ];
  "accounts": [
    {
      "name": "Project";
      "type": {
        "kind": "struct";
        "fields": [
          {
            "name": "projectId";
            "type": "string";
          },
          {
            "name": "owner";
            "type": "publicKey";
          },
          {
            "name": "ipfsCid";
            "type": "string";
          },
          {
            "name": "creditsIssued";
            "type": "u64";
          },
          {
            "name": "bump";
            "type": "u8";
          }
        ];
      };
    }
  ];
};

// Project account structure
export interface Project {
  projectId: string;
  owner: PublicKey;
  ipfsCid: string;
  creditsIssued: number;
  bump: number;
}

// IDL for the program
export const IDL: BlueCarbonRegistry = {
  "address": "GDEzy7wZw5VqSpBr9vDHiMiFa9QahNeZ8UfETMfVPakr",
  "metadata": {
    "name": "blue_carbon_registry",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "mintCredits",
      "docs": [
        "Mints new carbon credits (SPL tokens) to a recipient.",
        "This instruction uses Cross-Program Invocation (CPI) to call the SPL Token Program."
      ],
      "accounts": [
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "project",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "recipientTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "registerProject",
      "docs": [
        "Registers a new carbon credit project"
      ],
      "accounts": [
        {
          "name": "project",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "projectOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "projectId",
          "type": "string"
        },
        {
          "name": "ipfsCid",
          "type": "string"
        }
      ]
    },
    {
      "name": "retireCredits",
      "docs": [
        "Retires carbon credits permanently"
      ],
      "accounts": [
        {
          "name": "retirementAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fromAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferCredits",
      "docs": [
        "Transfers carbon credits between accounts"
      ],
      "accounts": [
        {
          "name": "fromAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "toAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fromAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Project",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "projectId",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "ipfsCid",
            "type": "string"
          },
          {
            "name": "creditsIssued",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};