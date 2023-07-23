"use client";

import { useEffect, useState } from "react";
import * as d3geo from "d3-geo";
import get from "lodash-es/get";
import * as topojson from "topojson-client";
import type { Feature, FeatureCollection } from "geojson";

import { useElSize } from "@/lib/composables/el-size";

export interface MapEarthProps {
  topoSrc: string;
  topoObject: string;
  color?: {
    globe?: string;
    land?: string;
    border?: string;
  };
  id?: string;
}

export function MapEarth(props: MapEarthProps) {
  const id = props.id ?? "map-earth";
  const [ref, size] = useElSize<HTMLDivElement>({ width: 0, height: 0 });
  const [features, setFeatures] = useState<Feature[]>([]);
  // Definition for the whole Earth sphere
  const outline: d3geo.ExtendedGeometryCollection = {
    geometries: [],
    type: "Sphere",
  };
  const projection = d3geo
    .geoNaturalEarth1()
    // https://observablehq.com/@d3/natural-earth - Tweaked
    .rotate([-10, 0])
    .fitWidth(size.width, outline);
  const geoPathGen = d3geo.geoPath(projection);
  // Size the svg to fit the height of the map
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [[_x0, _y0], [_x1, y1]] = geoPathGen.bounds(outline);

  useEffect(() => {
    async function fetchSrc() {
      const data = await (await fetch(props.topoSrc)).json();
      const coll = topojson.feature(
        data,
        get(data, props.topoObject)
      ) as ReturnType<typeof topojson.feature> as FeatureCollection;

      setFeatures(coll.features);
    }

    if (typeof props.topoSrc === "string") {
      fetchSrc();
    }
  }, [props.topoSrc, props.topoObject]);

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg viewBox={`0 0 ${size.width} ${y1}`}>
        <defs>
          <path
            id={`${id}__globe`}
            d={geoPathGen(outline) as string}
            fill={props.color?.globe}
          />
          {/*
            Some projections bleed outside the edges of the Earths sphere,
            create a clip path to keep things in bounds
          */}
          <clipPath id={`${id}__clip`}>
            <use href={`#${id}__globe`} />
          </clipPath>
        </defs>
        <g style={{ clipPath: `url(#${id}__clip)` }}>
          <use href={`#${id}__globe`} />
          {features.map((shape, i) => {
            return (
              <path
                key={i}
                d={geoPathGen(shape) as string}
                fill={props.color?.land}
                stroke={props.color?.border}
              >
                <title>{shape.properties?.name}</title>
              </path>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
