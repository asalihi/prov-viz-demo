import { async, ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { Injectable, NO_ERRORS_SCHEMA } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MapperService } from './mapper.service';
import { GraphComponent } from './graph.component';

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

@Injectable()
class MapperServiceStub {
  format(input:Object):{simplified:Object, extended:Object} {
    return GRAPH;
  }
}

describe('GraphComponent', () => {
  let component: GraphComponent;
  let fixture: ComponentFixture<GraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraphComponent ],
      imports: [NgbModule.forRoot()],
      providers: [{provide: MapperService, useClass: MapperServiceStub}],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    spyOn(GraphComponent.prototype, 'setGraphEventsListeners');
    fixture = TestBed.createComponent(GraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Graph', () => {
    it('should call setGraphEventsListeners', () => {
      expect(GraphComponent.prototype['setGraphEventsListeners']).toHaveBeenCalled();
    });

    it('should create graph', () => {
      expect(component['graph']).toBe(undefined);
      component['data'] = DATA;
      component['createGraph']();
      expect(JSON.stringify(component['graph'])).toBe(JSON.stringify(GRAPH));
    });

    it('should call createGraph and displayGraph on change', () => {
      let createGraphSpy:any = spyOn(component, 'createGraph');
      let displayGraphSpy:any = spyOn(component, 'displayGraph');
      expect(createGraphSpy.calls.any()).toBe(false, 'createGraph not called yet');
      expect(displayGraphSpy.calls.any()).toBe(false, 'displayGraph not called yet');
      component.ngOnChanges(DATA);
      expect(createGraphSpy.calls.any()).toBe(true, 'createGraph called');
      expect(displayGraphSpy.calls.any()).toBe(true, 'displayGraph called');
    });

    it('should create SVG in DOM', fakeAsync(() => {
        let svg:any = fixture.debugElement.nativeElement.querySelector('svg');
        expect(svg).toBe(null, 'svg is not defined yet');
        component.data = DATA;
        component.ngOnChanges(DATA);
        tick(500);
        svg = fixture.debugElement.nativeElement.querySelector('svg');
        expect(svg).not.toBe(null, 'svg is added to DOM');
        discardPeriodicTasks();
    }));
  });

  describe('View mode', () => {
    let dropDown:any;
    let dropDownButton:any;
    let simplifiedModeButton;
    let extendedModeButton;

    beforeEach(() => {
      dropDown = fixture.debugElement.nativeElement.querySelector('.select-view');
      dropDownButton = dropDown.querySelector('#selectView');
      simplifiedModeButton = dropDown.querySelector('#simplifiedMode');
      extendedModeButton = dropDown.querySelector('#extendedMode');
    });

    it('should have default mode set', () => {
      expect(component['mode']).toEqual(GraphComponent['defaultMode']);
    });

    it('should show/hide dropdown values on click on dropdown of mode selection', () => {
      expect(dropDown.getAttribute('class')).not.toContain('show', 'dropdown has not show tag in class list');
      expect(dropDownButton.getAttribute('aria-expanded')).toEqual('false', 'dropdown menu has its aria-expanded set to false');
      dropDownButton.click();
      fixture.detectChanges();
      expect(dropDown.getAttribute('class')).toContain('show', 'dropdown has show tag appended in class list');
      expect(dropDownButton.getAttribute('aria-expanded')).toEqual('true', 'dropdown menu has its aria-expanded set to true');
      dropDownButton.click();
      fixture.detectChanges();
      expect(dropDown.getAttribute('class')).not.toContain('show', 'show is removed from class list');
      expect(dropDownButton.getAttribute('aria-expanded')).toEqual('false', 'dropdown menu has again its aria-expanded attribute set to false');
    });

    it('should call changeMode and select item in dropdown accordingly', () => {
      spyOn(component, 'changeMode');
      expect(component['changeMode']).not.toHaveBeenCalled();
      dropDownButton.click();
      simplifiedModeButton.click();
      fixture.detectChanges();
      expect(component['changeMode']).toHaveBeenCalledWith('simplified');
      extendedModeButton.click();
      component['mode'] = 'extended';
      fixture.detectChanges();
      expect(component['changeMode']).toHaveBeenCalledWith('extended');
      expect(simplifiedModeButton.getAttribute('class')).not.toContain('selected', 'simplified mode is not selected when extended mode is selected');
      expect(extendedModeButton.getAttribute('class')).toContain('selected', 'extended mode is selected when extended mode is selected');
    });

    it('should select item in dropdown corresponding to view mode', () => {
      expect(simplifiedModeButton.getAttribute('class')).toContain('selected', 'by default, simplified mode is selected');
      expect(extendedModeButton.getAttribute('class')).not.toContain('selected', 'by default, extended mode is not selected');
      component['mode'] = 'extended';
      fixture.detectChanges();
      expect(simplifiedModeButton.getAttribute('class')).not.toContain('selected', 'simplified mode is not selected when extended mode is selected');
      expect(extendedModeButton.getAttribute('class')).toContain('selected', 'extended mode is not selected when extended mode is selected');
      component['mode'] = 'simplified';
      fixture.detectChanges();
      expect(simplifiedModeButton.getAttribute('class')).toContain('selected', 'simplified mode is selected when simplified mode is selected');
      expect(extendedModeButton.getAttribute('class')).not.toContain('selected', 'extended mode is not selected when simplified mode is selected');
    });
  });
});
