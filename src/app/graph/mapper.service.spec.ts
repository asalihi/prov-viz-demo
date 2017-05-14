import { MapperService } from './mapper.service';

const DATA:Object = {
  "graph": {
    "type": "Provenance",
    "directed": true,
    "nodes": [
      {
        "id": "3ee4bf2a-c8d0-4f10-b3b3-46b7151b4ea0",
        "type": "activity",
        "label": "Generation of slice mpg141017_a1-2",
        "metadata": {
          "subType": "BBP Activity"
        }
      },
      {
        "id": "bundle_parent_3ee4bf2a-c8d0-4f10-b3b3-46b7151b4ea0",
        "type": "agent",
        "label": "2 agents",
        "metadata": {
          "members": [
            {
              "id": "1c4d3683-dcfc-489f-adbb-5de815b1b89a",
              "type": "agent",
              "metadata": {
                "subType": "contributor"
              }
            },
            {
              "id": "2d16451c-6661-4b9a-aa7b-e4804386f577",
              "type": "agent",
              "metadata": {
                "subType": "contributor"
              }
            }
          ]
        }
      },
      {
        "id": "807ded58-579d-452d-8dd2-a5568689b2bb",
        "type": "entity",
        "label": "Mus musculus",
        "metadata": {
          "subType": "specimen"
        }
      },
      {
        "id": "7212ff61-b2f6-461f-8f4e-ffdae735e3d4",
        "type": "entity",
        "label": "Field CA1, stratum pyramidale",
        "metadata": {
          "subType": "sample"
        }
      }
    ],
    "edges": [
      {
        "source": "bundle_parent_3ee4bf2a-c8d0-4f10-b3b3-46b7151b4ea0",
        "target": "3ee4bf2a-c8d0-4f10-b3b3-46b7151b4ea0",
        "metadata": {
          "label": "wasAssociatedTo"
        }
      },
      {
        "source": "3ee4bf2a-c8d0-4f10-b3b3-46b7151b4ea0",
        "target": "807ded58-579d-452d-8dd2-a5568689b2bb",
        "metadata": {
          "label": "used"
        }
      },
      {
        "source": "7212ff61-b2f6-461f-8f4e-ffdae735e3d4",
        "target": "3ee4bf2a-c8d0-4f10-b3b3-46b7151b4ea0",
        "metadata": {
          "label": "wasGeneratedFrom"
        }
      }
    ]
  }
};

const GRAPH:{simplified:Object, extended:Object} = {
	"simplified": {
		"value": {
			"rankdir": "BT"
		},
		"nodes": [
			{
				"v": "807ded58-579d-452d-8dd2-a5568689b2bb",
				"value": {
					"type": "entity",
					"label": "Mus musculus",
					"subType": "specimen",
          "labelType": "html"
				}
			},
			{
				"v": "7212ff61-b2f6-461f-8f4e-ffdae735e3d4",
				"value": {
					"type": "entity",
					"label": "Field CA1, stratum pyramidale",
					"subType": "sample",
          "labelType": "html"
				}
			}
		],
		"edges": [
			{
				"v": "7212ff61-b2f6-461f-8f4e-ffdae735e3d4",
				"w": "807ded58-579d-452d-8dd2-a5568689b2bb",
				"value": {
					"label": "was derived from"
				}
			}
		]
	},
	"extended": {
		"value": {
			"rankdir": "BT"
		},
		"nodes": [
			{
				"v": "3ee4bf2a-c8d0-4f10-b3b3-46b7151b4ea0",
				"value": {
					"type": "activity",
					"label": "Generation of slice mpg141017_a1-2",
					"subType": "BBP Activity",
          "labelType": "html"
				}
			},
			{
				"v": "bundle_parent_3ee4bf2a-c8d0-4f10-b3b3-46b7151b4ea0",
				"value": {
					"type": "agent",
					"label": "2 agents",
					"subType": null,
					"members": [
						{
							"id": "1c4d3683-dcfc-489f-adbb-5de815b1b89a",
							"type": "agent",
							"metadata": {
								"subType": "contributor"
							}
						},
						{
							"id": "2d16451c-6661-4b9a-aa7b-e4804386f577",
							"type": "agent",
							"metadata": {
								"subType": "contributor"
							}
						}
					],
          "labelType": "html"
				}
			},
			{
				"v": "807ded58-579d-452d-8dd2-a5568689b2bb",
				"value": {
					"type": "entity",
					"label": "Mus musculus",
					"subType": "specimen",
          "labelType": "html"
				}
			},
			{
				"v": "7212ff61-b2f6-461f-8f4e-ffdae735e3d4",
				"value": {
					"type": "entity",
					"label": "Field CA1, stratum pyramidale",
					"subType": "sample",
          "labelType": "html"
				}
			}
		],
		"edges": [
			{
				"v": "bundle_parent_3ee4bf2a-c8d0-4f10-b3b3-46b7151b4ea0",
				"w": "3ee4bf2a-c8d0-4f10-b3b3-46b7151b4ea0",
				"value": {
					"label": "wasAssociatedTo"
				}
			},
			{
				"v": "3ee4bf2a-c8d0-4f10-b3b3-46b7151b4ea0",
				"w": "807ded58-579d-452d-8dd2-a5568689b2bb",
				"value": {
					"label": "used"
				}
			},
			{
				"v": "7212ff61-b2f6-461f-8f4e-ffdae735e3d4",
				"w": "3ee4bf2a-c8d0-4f10-b3b3-46b7151b4ea0",
				"value": {
					"label": "wasGeneratedFrom"
				}
			}
		]
	}
};

describe('MapperService', () => {
  let mapperService: MapperService;

  beforeEach(() => {
    mapperService = new MapperService();
  });

  it('should return null object when no input was specified', () => {
    var result = mapperService.format();
    expect(result).toBe(null);
  });

  it('should call functions in charge of creating simplified and extended graphs', () => {
    spyOn(mapperService, 'createCompleteGraph');
    spyOn(mapperService, 'createSimplifiedGraph');
    expect(mapperService['createCompleteGraph']).not.toHaveBeenCalled();
    expect(mapperService['createSimplifiedGraph']).not.toHaveBeenCalled();
    var graph = mapperService.format(DATA);
    expect(mapperService['createCompleteGraph']).toHaveBeenCalled();
    expect(mapperService['createSimplifiedGraph']).toHaveBeenCalled();
  });

  it('should create extended graph', () => {
    mapperService['input'] = DATA;
    mapperService['createCompleteGraph']();
    expect(JSON.stringify(mapperService['completeGraph'])).toEqual(JSON.stringify(GRAPH['extended']));
  });

  it('should create simplified graph', () => {
    mapperService['input'] = DATA;
    mapperService['convertNodesAndEdges']();
    mapperService['createSimplifiedGraph']();
    expect(JSON.stringify(mapperService['simplifiedGraph'])).toEqual(JSON.stringify(GRAPH['simplified']));
  });
});
